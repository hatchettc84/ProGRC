import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { SecurityPolicy } from '../../entities/auth/securityPolicy.entity';
import { User } from '../../entities/user.entity';
import { MfaDevice } from '../../entities/auth/mfaDevice.entity';
// import { LoggerService } from '../../logger/logger.service';
import { 
  PolicyType, 
  PolicyScope, 
  PolicyAction, 
  MfaEnforcementRules,
  MfaDeviceType,
  MfaDeviceStatus 
} from '../../entities/auth/mfa.types';
import { UserRole } from '../../masterData/userRoles.entity';

@Injectable()
export class SecurityPolicyService {
  constructor(
    @InjectRepository(SecurityPolicy) 
    private policyRepo: Repository<SecurityPolicy>,
    
    @InjectRepository(User) 
    private userRepo: Repository<User>,
    
    @InjectRepository(MfaDevice) 
    private mfaDeviceRepo: Repository<MfaDevice>,
    
    // private loggerService: LoggerService,
  ) {}

  async createMfaPolicy(createdBy: string, policyData: {
    scope: PolicyScope,
    scope_id?: string,
    rules: MfaEnforcementRules,
    target_users?: string[]
  }): Promise<SecurityPolicy> {
    const creator = await this.userRepo.findOne({ 
      where: { id: createdBy },
      relations: ['role', 'customer']
    });

    if (!creator) {
      throw new NotFoundException('Creator user not found');
    }

    // Validate permissions
    await this.validatePolicyPermissions(creator, policyData.scope, policyData.scope_id);

    const policy = this.policyRepo.create({
      name: `MFA Enforcement - ${policyData.scope}`,
      type: PolicyType.MFA_ENFORCEMENT,
      scope: policyData.scope,
      scope_id: policyData.scope_id,
      rules: policyData.rules,
      action: PolicyAction.ENFORCE,
      created_by: createdBy,
      priority: await this.calculatePriority(policyData.scope),
    });

    const savedPolicy = await this.policyRepo.save(policy);

    // If targeting specific users, create individual policies
    if (policyData.target_users?.length > 0) {
      await this.createUserSpecificPolicies(createdBy, policyData.target_users, policyData.rules);
    }

    console.log('MFA_POLICY_CREATED', {
      policy_id: savedPolicy.id,
      created_by: createdBy,
      scope: policyData.scope,
      scope_id: policyData.scope_id,
    });

    return savedPolicy;
  }

  async getMfaPolicy(userId: string): Promise<any> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['role', 'customer']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get applicable policies in order of priority
    const policies = await this.policyRepo.find({
      where: [
        // User-specific policy (highest priority)
        { type: PolicyType.MFA_ENFORCEMENT, scope: PolicyScope.USER, scope_id: userId, is_active: true },
        // Role-specific policy
        { type: PolicyType.MFA_ENFORCEMENT, scope: PolicyScope.ROLE, scope_id: user.role_id.toString(), is_active: true },
        // Organization policy
        { type: PolicyType.MFA_ENFORCEMENT, scope: PolicyScope.ORGANIZATION, scope_id: user.customer_id, is_active: true },
        // Global policy (lowest priority)
        { type: PolicyType.MFA_ENFORCEMENT, scope: PolicyScope.GLOBAL, is_active: true },
      ],
      order: { priority: 'DESC', created_at: 'DESC' },
    });

    // Return the highest priority applicable policy
    const applicablePolicy = policies[0];
    
    if (!applicablePolicy) {
      return {
        mfa_required: false,
        policy: null,
      };
    }

    const rules = applicablePolicy.rules as MfaEnforcementRules;
    
    return {
      mfa_required: rules.required,
      rules,
      policy_id: applicablePolicy.id,
      enforcement_level: applicablePolicy.scope,
      grace_period_ends: this.calculateGracePeriodEnd(applicablePolicy),
    };
  }

  async getMfaPolicies(requesterId: string, filters: {
    scope?: PolicyScope,
    scope_id?: string
  }): Promise<SecurityPolicy[]> {
    const requester = await this.userRepo.findOne({
      where: { id: requesterId },
      relations: ['role', 'customer']
    });

    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    let whereConditions: any = {
      type: PolicyType.MFA_ENFORCEMENT,
      is_active: true,
    };

    // Apply scope filtering based on user permissions
    if (requester.role_id === UserRole.SuperAdmin) {
      // Super admin can see all policies
      if (filters.scope) whereConditions.scope = filters.scope;
      if (filters.scope_id) whereConditions.scope_id = filters.scope_id;
    } else if (requester.role_id === UserRole.CSM) {
      // CSM can see global and organization policies they manage
      whereConditions = [
        { ...whereConditions, scope: PolicyScope.GLOBAL },
        { ...whereConditions, scope: PolicyScope.ORGANIZATION, scope_id: In(await this.getCsmOrganizations(requesterId)) },
      ];
    } else if (requester.role_id === UserRole.OrgAdmin) {
      // Org admin can only see their organization's policies
      whereConditions.scope_id = requester.customer_id;
    } else {
      throw new ForbiddenException('Insufficient permissions to view policies');
    }

    return await this.policyRepo.find({
      where: whereConditions,
      relations: ['creator'],
      order: { priority: 'DESC', created_at: 'DESC' },
    });
  }

  async updateMfaPolicy(requesterId: string, policyId: string, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    const policy = await this.policyRepo.findOne({
      where: { id: policyId },
      relations: ['creator'],
    });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    const requester = await this.userRepo.findOne({
      where: { id: requesterId },
      relations: ['role', 'customer']
    });

    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    await this.validatePolicyPermissions(requester, policy.scope, policy.scope_id);

    // Update allowed fields
    if (updates.rules) policy.rules = updates.rules;
    if (updates.is_active !== undefined) policy.is_active = updates.is_active;
    if (updates.action) policy.action = updates.action;

    const updatedPolicy = await this.policyRepo.save(policy);

    console.log('MFA_POLICY_UPDATED', {
      policy_id: policyId,
      updated_by: requesterId,
      changes: updates,
    });

    return updatedPolicy;
  }

  async deleteMfaPolicy(requesterId: string, policyId: string): Promise<void> {
    const policy = await this.policyRepo.findOne({ where: { id: policyId } });

    if (!policy) {
      throw new NotFoundException('Policy not found');
    }

    const requester = await this.userRepo.findOne({
      where: { id: requesterId },
      relations: ['role', 'customer']
    });

    if (!requester) {
      throw new NotFoundException('Requester not found');
    }

    await this.validatePolicyPermissions(requester, policy.scope, policy.scope_id);

    // Soft delete by marking as inactive
    policy.is_active = false;
    await this.policyRepo.save(policy);

    console.log('MFA_POLICY_DELETED', {
      policy_id: policyId,
      deleted_by: requesterId,
    });
  }

  // Check if user needs to complete MFA setup
  async checkMfaRequirement(userId: string): Promise<{
    mfa_required: boolean,
    user_compliant: boolean,
    grace_period_remaining: number | null,
    required_actions: string[]
  }> {
    const policy = await this.getMfaPolicy(userId);
    
    if (!policy.mfa_required) {
      return {
        mfa_required: false,
        user_compliant: true,
        grace_period_remaining: null,
        required_actions: [],
      };
    }

    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['mfa_devices'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activeDevices = user.mfa_devices?.filter(d => d.status === MfaDeviceStatus.ACTIVE) || [];
    const rules = policy.rules as MfaEnforcementRules;
    
    const requiredActions = [];
    let userCompliant = true;

    // Check if user has MFA enabled
    if (!user.mfa_enabled) {
      userCompliant = false;
      requiredActions.push('Enable MFA on your account');
    }

    // Check minimum devices requirement
    if (activeDevices.length < rules.min_devices) {
      userCompliant = false;
      requiredActions.push(`Configure at least ${rules.min_devices} MFA device(s)`);
    }

    // Check allowed device types
    const userDeviceTypes = activeDevices.map(d => d.type);
    const hasAllowedType = rules.allowed_types.some(type => userDeviceTypes.includes(type));
    
    if (activeDevices.length > 0 && !hasAllowedType) {
      userCompliant = false;
      requiredActions.push(`Configure one of these MFA types: ${rules.allowed_types.join(', ')}`);
    }

    // Calculate grace period remaining
    let gracePeriodRemaining = null;
    if (policy.grace_period_ends) {
      const now = new Date();
      const graceEnd = new Date(policy.grace_period_ends);
      gracePeriodRemaining = Math.max(0, Math.ceil((graceEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return {
      mfa_required: true,
      user_compliant: userCompliant,
      grace_period_remaining: gracePeriodRemaining,
      required_actions: requiredActions,
    };
  }

  // Private helper methods
  private async validatePolicyPermissions(user: User, scope: PolicyScope, scopeId?: string): Promise<void> {
    switch (user.role_id) {
      case UserRole.SuperAdmin:
        // Super admin can manage all policies
        return;
        
      case UserRole.CSM:
        // CSM can manage global and organization policies for their customers
        if (scope === PolicyScope.GLOBAL) return;
        if (scope === PolicyScope.ORGANIZATION) {
          const managedOrgs = await this.getCsmOrganizations(user.id);
          if (managedOrgs.includes(scopeId)) return;
        }
        break;
        
      case UserRole.OrgAdmin:
        // Org admin can only manage their organization's policies
        if (scope === PolicyScope.ORGANIZATION && scopeId === user.customer_id) return;
        if (scope === PolicyScope.ROLE && scopeId) {
          // Can manage role policies within their organization
          return;
        }
        if (scope === PolicyScope.USER && scopeId) {
          // Can manage user policies within their organization
          const targetUser = await this.userRepo.findOne({ where: { id: scopeId } });
          if (targetUser && targetUser.customer_id === user.customer_id) return;
        }
        break;
    }
    
    throw new ForbiddenException('Insufficient permissions to manage this policy');
  }

  private async calculatePriority(scope: PolicyScope): Promise<number> {
    const basePriorities = {
      [PolicyScope.USER]: 1000,
      [PolicyScope.ROLE]: 800,
      [PolicyScope.ORGANIZATION]: 600,
      [PolicyScope.GLOBAL]: 400,
    };
    
    return basePriorities[scope];
  }

  private async createUserSpecificPolicies(createdBy: string, userIds: string[], rules: MfaEnforcementRules): Promise<void> {
    const userPolicies = userIds.map(userId => 
      this.policyRepo.create({
        name: `MFA Enforcement - User Specific`,
        type: PolicyType.MFA_ENFORCEMENT,
        scope: PolicyScope.USER,
        scope_id: userId,
        rules,
        action: PolicyAction.ENFORCE,
        created_by: createdBy,
        priority: 1000,
      })
    );

    await this.policyRepo.save(userPolicies);
  }

  private calculateGracePeriodEnd(policy: SecurityPolicy): Date | null {
    const rules = policy.rules as MfaEnforcementRules;
    if (!rules.grace_period_days) return null;
    
    const enforcementDate = rules.enforcement_date ? new Date(rules.enforcement_date) : policy.created_at;
    return new Date(enforcementDate.getTime() + (rules.grace_period_days * 24 * 60 * 60 * 1000));
  }

  private async getCsmOrganizations(csmId: string): Promise<string[]> {
    // Implementation to get organizations managed by CSM
    // This would involve querying the CustomerCsm entity
    // For now, return empty array - implement based on your CSM-customer relationship
    return [];
  }

  // Add missing methods for controller compatibility
  async getUserAccessiblePolicies(userRole: UserRole, customerId: string): Promise<SecurityPolicy[]> {
    const whereConditions: any = {
      type: PolicyType.MFA_ENFORCEMENT,
      is_active: true,
    };

    if (userRole === UserRole.SuperAdmin) {
      // Super admin can see all policies
    } else if (userRole === UserRole.CSM) {
      // CSM can see global and organization policies
      whereConditions.scope = In([PolicyScope.GLOBAL, PolicyScope.ORGANIZATION]);
    } else if (userRole === UserRole.OrgAdmin) {
      // Org admin can see org-specific policies
      whereConditions.scope_id = customerId;
    } else {
      throw new ForbiddenException('Insufficient permissions to view policies');
    }

    return await this.policyRepo.find({
      where: whereConditions,
      relations: ['creator'],
      order: { priority: 'DESC', created_at: 'DESC' },
    });
  }

  async createPolicy(policyData: {
    policy_name: string;
    scope: PolicyScope;
    enforcement_level: any;
    allowed_mfa_types?: any[];
    grace_period_hours?: number;
    target_entity_id?: string;
    description?: string;
  }, createdBy: string): Promise<SecurityPolicy> {
    // Map to createMfaPolicy format
    const mfaRules: MfaEnforcementRules = {
      required: policyData.enforcement_level === 'REQUIRED',
      allowed_types: policyData.allowed_mfa_types || [MfaDeviceType.TOTP, MfaDeviceType.PASSKEY, MfaDeviceType.EMAIL],
      min_devices: 1,
      max_devices: 10,
      grace_period_days: policyData.grace_period_hours ? Math.ceil(policyData.grace_period_hours / 24) : 0,
      bypass_roles: [],
    };

    return await this.createMfaPolicy(createdBy, {
      scope: policyData.scope,
      scope_id: policyData.target_entity_id,
      rules: mfaRules,
    });
  }
} 