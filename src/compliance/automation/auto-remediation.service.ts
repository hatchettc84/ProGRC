import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { getPromptForControl } from '../prompts/control-prompts';

/**
 * Remediation priority
 */
export enum RemediationPriority {
  CRITICAL = 'critical', // Must address immediately (compliance blocker)
  HIGH = 'high', // Address within 1 week
  MEDIUM = 'medium', // Address within 1 month
  LOW = 'low', // Address when resources available
}

/**
 * Remediation effort estimate
 */
export enum RemediationEffort {
  MINIMAL = 'minimal', // < 4 hours
  LOW = 'low', // 1-3 days
  MEDIUM = 'medium', // 1-2 weeks
  HIGH = 'high', // 2-4 weeks
  EXTENSIVE = 'extensive', // > 1 month
}

/**
 * Remediation action type
 */
export enum RemediationActionType {
  DOCUMENTATION = 'documentation', // Create/update documentation
  POLICY = 'policy', // Create/update policy
  CONFIGURATION = 'configuration', // Technical configuration change
  PROCESS = 'process', // Implement new process
  TRAINING = 'training', // Conduct training
  EVIDENCE_COLLECTION = 'evidence_collection', // Gather evidence
  AUDIT = 'audit', // Perform audit/assessment
  MONITORING = 'monitoring', // Implement monitoring
}

/**
 * Remediation action
 */
export interface RemediationAction {
  id: string;
  type: RemediationActionType;
  title: string;
  description: string;
  priority: RemediationPriority;
  effort: RemediationEffort;
  estimatedDays: number;
  assignedRole: string;
  dependencies: string[]; // IDs of actions that must complete first
  acceptanceCriteria: string[];
  resources: RemediationResource[];
  automatable: boolean; // Can this be automated?
  automationSuggestion?: string;
}

/**
 * Remediation resource
 */
export interface RemediationResource {
  type: 'tool' | 'template' | 'guide' | 'service';
  name: string;
  description: string;
  url?: string;
  cost?: string;
}

/**
 * Complete remediation plan
 */
export interface RemediationPlan {
  controlId: string;
  controlName: string;
  controlFamily: string;
  currentStatus: string;
  targetStatus: string;
  totalEstimatedDays: number;
  totalActions: number;
  criticalActions: number;
  actions: RemediationAction[];
  estimatedCompletionDate: Date;
  milestones: Milestone[];
}

/**
 * Milestone for POAM
 */
export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completedActions: string[]; // Action IDs that should be completed
  percentageOfPlan: number;
}

/**
 * Auto-Remediation Service
 *
 * Automatically generates detailed remediation plans for compliance gaps
 * Provides actionable steps, effort estimates, and POAM milestones
 */
@Injectable()
export class AutoRemediationService {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Generate complete remediation plan for a control
   */
  async generateRemediationPlan(
    controlId: string,
    controlName: string,
    currentStatus: string,
    gaps: string[],
    recommendations: Array<{ priority: string; action: string; rationale: string }>,
    evidenceSuggestions: Array<{ type: string; description: string; priority: string }>
  ): Promise<RemediationPlan> {
    const familyCode = controlName.substring(0, 2).toUpperCase();
    const familyPrompt = getPromptForControl(controlName);

    // Generate remediation actions from gaps, recommendations, and evidence needs
    const actions: RemediationAction[] = [];
    let actionIdCounter = 1;

    // 1. Create actions from gaps
    for (const gap of gaps) {
      const action = this.createActionFromGap(
        `${controlId}-${actionIdCounter++}`,
        gap,
        familyCode
      );
      if (action) actions.push(action);
    }

    // 2. Create actions from recommendations
    for (const rec of recommendations) {
      const action = this.createActionFromRecommendation(
        `${controlId}-${actionIdCounter++}`,
        rec,
        familyCode
      );
      if (action) actions.push(action);
    }

    // 3. Create actions from evidence needs
    for (const evidenceNeed of evidenceSuggestions) {
      if (evidenceNeed.priority === 'required' || evidenceNeed.priority === 'recommended') {
        const action = this.createActionFromEvidenceNeed(
          `${controlId}-${actionIdCounter++}`,
          evidenceNeed,
          familyCode
        );
        if (action) actions.push(action);
      }
    }

    // Sort actions by priority
    actions.sort((a, b) => {
      const priorityOrder = {
        [RemediationPriority.CRITICAL]: 1,
        [RemediationPriority.HIGH]: 2,
        [RemediationPriority.MEDIUM]: 3,
        [RemediationPriority.LOW]: 4,
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Calculate dependencies (critical/high priority actions come first)
    this.calculateDependencies(actions);

    // Calculate total estimated days
    const totalEstimatedDays = actions.reduce((sum, a) => sum + a.estimatedDays, 0);

    // Generate milestones
    const milestones = this.generateMilestones(actions, controlName);

    // Determine target status based on plan completeness
    const targetStatus = this.determineTargetStatus(currentStatus, actions.length);

    // Estimate completion date
    const estimatedCompletionDate = new Date();
    estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + totalEstimatedDays);

    const criticalActions = actions.filter(a => a.priority === RemediationPriority.CRITICAL).length;

    this.logger.log(
      `Generated remediation plan for ${controlName}: ${actions.length} actions, ` +
      `${criticalActions} critical, ~${totalEstimatedDays} days`
    );

    return {
      controlId,
      controlName,
      controlFamily: familyCode,
      currentStatus,
      targetStatus,
      totalEstimatedDays,
      totalActions: actions.length,
      criticalActions,
      actions,
      estimatedCompletionDate,
      milestones,
    };
  }

  /**
   * Create remediation action from identified gap
   */
  private createActionFromGap(
    id: string,
    gap: string,
    familyCode: string
  ): RemediationAction | null {
    const gapLower = gap.toLowerCase();

    // Determine action type based on gap description
    let type = RemediationActionType.CONFIGURATION;
    if (gapLower.includes('documentation') || gapLower.includes('document')) {
      type = RemediationActionType.DOCUMENTATION;
    } else if (gapLower.includes('policy') || gapLower.includes('procedure')) {
      type = RemediationActionType.POLICY;
    } else if (gapLower.includes('training') || gapLower.includes('awareness')) {
      type = RemediationActionType.TRAINING;
    } else if (gapLower.includes('log') || gapLower.includes('monitor')) {
      type = RemediationActionType.MONITORING;
    } else if (gapLower.includes('audit') || gapLower.includes('assessment')) {
      type = RemediationActionType.AUDIT;
    } else if (gapLower.includes('process') || gapLower.includes('workflow')) {
      type = RemediationActionType.PROCESS;
    }

    // Determine priority based on gap severity keywords
    let priority = RemediationPriority.MEDIUM;
    if (gapLower.includes('critical') || gapLower.includes('no') || gapLower.includes('missing')) {
      priority = RemediationPriority.HIGH;
    } else if (gapLower.includes('incomplete') || gapLower.includes('partial')) {
      priority = RemediationPriority.MEDIUM;
    }

    // Estimate effort based on action type
    const effortEstimate = this.estimateEffort(type);

    // Generate resources based on family and type
    const resources = this.getResourcesForAction(type, familyCode);

    return {
      id,
      type,
      title: `Address: ${gap.substring(0, 80)}${gap.length > 80 ? '...' : ''}`,
      description: `Remediate identified gap: ${gap}`,
      priority,
      effort: effortEstimate.effort,
      estimatedDays: effortEstimate.days,
      assignedRole: this.getAssignedRole(type, familyCode),
      dependencies: [],
      acceptanceCriteria: this.generateAcceptanceCriteria(type, gap),
      resources,
      automatable: this.isAutomatable(type),
      automationSuggestion: this.isAutomatable(type) ? this.getAutomationSuggestion(type) : undefined,
    };
  }

  /**
   * Create remediation action from recommendation
   */
  private createActionFromRecommendation(
    id: string,
    recommendation: { priority: string; action: string; rationale: string },
    familyCode: string
  ): RemediationAction | null {
    const actionLower = recommendation.action.toLowerCase();

    // Determine type
    let type = RemediationActionType.CONFIGURATION;
    if (actionLower.includes('document')) {
      type = RemediationActionType.DOCUMENTATION;
    } else if (actionLower.includes('policy')) {
      type = RemediationActionType.POLICY;
    } else if (actionLower.includes('training')) {
      type = RemediationActionType.TRAINING;
    } else if (actionLower.includes('monitor')) {
      type = RemediationActionType.MONITORING;
    } else if (actionLower.includes('audit') || actionLower.includes('assess')) {
      type = RemediationActionType.AUDIT;
    }

    // Map priority
    let priority = RemediationPriority.MEDIUM;
    if (recommendation.priority === 'high') {
      priority = RemediationPriority.HIGH;
    } else if (recommendation.priority === 'low') {
      priority = RemediationPriority.LOW;
    }

    const effortEstimate = this.estimateEffort(type);
    const resources = this.getResourcesForAction(type, familyCode);

    return {
      id,
      type,
      title: recommendation.action.substring(0, 100),
      description: `${recommendation.action}\n\nRationale: ${recommendation.rationale}`,
      priority,
      effort: effortEstimate.effort,
      estimatedDays: effortEstimate.days,
      assignedRole: this.getAssignedRole(type, familyCode),
      dependencies: [],
      acceptanceCriteria: this.generateAcceptanceCriteria(type, recommendation.action),
      resources,
      automatable: this.isAutomatable(type),
      automationSuggestion: this.isAutomatable(type) ? this.getAutomationSuggestion(type) : undefined,
    };
  }

  /**
   * Create remediation action from evidence need
   */
  private createActionFromEvidenceNeed(
    id: string,
    evidenceNeed: { type: string; description: string; priority: string },
    familyCode: string
  ): RemediationAction | null {
    return {
      id,
      type: RemediationActionType.EVIDENCE_COLLECTION,
      title: `Collect Evidence: ${evidenceNeed.type}`,
      description: evidenceNeed.description,
      priority: evidenceNeed.priority === 'required' ? RemediationPriority.HIGH : RemediationPriority.MEDIUM,
      effort: RemediationEffort.LOW,
      estimatedDays: 2,
      assignedRole: this.getAssignedRole(RemediationActionType.EVIDENCE_COLLECTION, familyCode),
      dependencies: [],
      acceptanceCriteria: [
        `${evidenceNeed.type} evidence collected and documented`,
        'Evidence uploaded to compliance platform',
        'Evidence reviewed and approved by compliance team',
      ],
      resources: this.getResourcesForAction(RemediationActionType.EVIDENCE_COLLECTION, familyCode),
      automatable: false,
      automationSuggestion: undefined,
    };
  }

  /**
   * Estimate effort for action type
   */
  private estimateEffort(type: RemediationActionType): { effort: RemediationEffort; days: number } {
    const estimates: Record<RemediationActionType, { effort: RemediationEffort; days: number }> = {
      [RemediationActionType.DOCUMENTATION]: { effort: RemediationEffort.LOW, days: 3 },
      [RemediationActionType.POLICY]: { effort: RemediationEffort.MEDIUM, days: 7 },
      [RemediationActionType.CONFIGURATION]: { effort: RemediationEffort.LOW, days: 2 },
      [RemediationActionType.PROCESS]: { effort: RemediationEffort.MEDIUM, days: 10 },
      [RemediationActionType.TRAINING]: { effort: RemediationEffort.MEDIUM, days: 14 },
      [RemediationActionType.EVIDENCE_COLLECTION]: { effort: RemediationEffort.MINIMAL, days: 2 },
      [RemediationActionType.AUDIT]: { effort: RemediationEffort.HIGH, days: 14 },
      [RemediationActionType.MONITORING]: { effort: RemediationEffort.LOW, days: 5 },
    };
    return estimates[type] || { effort: RemediationEffort.MEDIUM, days: 7 };
  }

  /**
   * Get assigned role for action
   */
  private getAssignedRole(type: RemediationActionType, familyCode: string): string {
    const roleMap: Record<RemediationActionType, string> = {
      [RemediationActionType.DOCUMENTATION]: 'Technical Writer / Compliance Analyst',
      [RemediationActionType.POLICY]: 'Compliance Manager / Legal',
      [RemediationActionType.CONFIGURATION]: 'DevOps Engineer / Security Engineer',
      [RemediationActionType.PROCESS]: 'Process Owner / Compliance Manager',
      [RemediationActionType.TRAINING]: 'Security Awareness Lead / HR',
      [RemediationActionType.EVIDENCE_COLLECTION]: 'Compliance Analyst',
      [RemediationActionType.AUDIT]: 'Internal Auditor / Compliance Manager',
      [RemediationActionType.MONITORING]: 'DevOps Engineer / Security Operations',
    };
    return roleMap[type] || 'Compliance Team';
  }

  /**
   * Check if action can be automated
   */
  private isAutomatable(type: RemediationActionType): boolean {
    return type === RemediationActionType.CONFIGURATION || type === RemediationActionType.MONITORING;
  }

  /**
   * Get automation suggestion for action
   */
  private getAutomationSuggestion(type: RemediationActionType): string {
    const suggestions: Record<RemediationActionType, string> = {
      [RemediationActionType.CONFIGURATION]: 'Use Infrastructure-as-Code (Terraform/CloudFormation) for repeatable configuration',
      [RemediationActionType.MONITORING]: 'Implement automated monitoring with alerting (CloudWatch/Datadog/Prometheus)',
      [RemediationActionType.DOCUMENTATION]: 'Generate documentation from code comments',
      [RemediationActionType.POLICY]: '',
      [RemediationActionType.PROCESS]: '',
      [RemediationActionType.TRAINING]: '',
      [RemediationActionType.EVIDENCE_COLLECTION]: '',
      [RemediationActionType.AUDIT]: '',
    };
    return suggestions[type] || '';
  }

  /**
   * Generate acceptance criteria for action
   */
  private generateAcceptanceCriteria(type: RemediationActionType, description: string): string[] {
    const baseCriteria: Record<RemediationActionType, string[]> = {
      [RemediationActionType.DOCUMENTATION]: [
        'Documentation created and peer-reviewed',
        'Documentation uploaded to central repository',
        'Documentation accessible to relevant stakeholders',
      ],
      [RemediationActionType.POLICY]: [
        'Policy drafted and reviewed by stakeholders',
        'Policy approved by management',
        'Policy published and communicated to organization',
        'Policy training completed for relevant staff',
      ],
      [RemediationActionType.CONFIGURATION]: [
        'Configuration implemented in development environment',
        'Configuration tested and validated',
        'Configuration deployed to production',
        'Configuration documented',
      ],
      [RemediationActionType.PROCESS]: [
        'Process documented with clear steps',
        'Process approved by process owner',
        'Staff trained on new process',
        'Process implemented and monitored',
      ],
      [RemediationActionType.TRAINING]: [
        'Training materials developed',
        'Training sessions scheduled and conducted',
        'Training attendance tracked (>90% completion)',
        'Training effectiveness assessed',
      ],
      [RemediationActionType.EVIDENCE_COLLECTION]: [
        'Evidence collected and documented',
        'Evidence uploaded to compliance platform',
        'Evidence reviewed and approved',
      ],
      [RemediationActionType.AUDIT]: [
        'Audit scope defined and approved',
        'Audit conducted and findings documented',
        'Audit report reviewed with stakeholders',
        'Remediation plan created for findings',
      ],
      [RemediationActionType.MONITORING]: [
        'Monitoring solution configured',
        'Alerts configured for critical events',
        'Monitoring tested and validated',
        'On-call procedures documented',
      ],
    };
    return baseCriteria[type] || ['Action completed and verified'];
  }

  /**
   * Get resources for action
   */
  private getResourcesForAction(type: RemediationActionType, familyCode: string): RemediationResource[] {
    const resources: RemediationResource[] = [];

    switch (type) {
      case RemediationActionType.CONFIGURATION:
        resources.push({
          type: 'tool',
          name: 'Terraform',
          description: 'Infrastructure as Code tool for automated configuration',
          url: 'https://www.terraform.io/',
        });
        break;
      case RemediationActionType.MONITORING:
        resources.push({
          type: 'service',
          name: 'Datadog',
          description: 'Monitoring and observability platform',
          url: 'https://www.datadoghq.com/',
          cost: 'Paid',
        });
        break;
      case RemediationActionType.DOCUMENTATION:
        resources.push({
          type: 'template',
          name: 'NIST Documentation Templates',
          description: 'Standard templates for compliance documentation',
          url: 'https://csrc.nist.gov/',
        });
        break;
      case RemediationActionType.POLICY:
        resources.push({
          type: 'template',
          name: 'SANS Policy Templates',
          description: 'Industry-standard security policy templates',
          url: 'https://www.sans.org/information-security-policy/',
        });
        break;
    }

    return resources;
  }

  /**
   * Calculate dependencies between actions
   */
  private calculateDependencies(actions: RemediationAction[]): void {
    // Policy actions should come before process actions
    const policyActions = actions.filter(a => a.type === RemediationActionType.POLICY);
    const processActions = actions.filter(a => a.type === RemediationActionType.PROCESS);

    for (const processAction of processActions) {
      policyActions.forEach(policyAction => {
        if (!processAction.dependencies.includes(policyAction.id)) {
          processAction.dependencies.push(policyAction.id);
        }
      });
    }

    // Documentation should come after configuration
    const configActions = actions.filter(a => a.type === RemediationActionType.CONFIGURATION);
    const docActions = actions.filter(a => a.type === RemediationActionType.DOCUMENTATION);

    for (const docAction of docActions) {
      configActions.forEach(configAction => {
        if (!docAction.dependencies.includes(configAction.id)) {
          docAction.dependencies.push(configAction.id);
        }
      });
    }

    // Training should come after policy and documentation
    const trainingActions = actions.filter(a => a.type === RemediationActionType.TRAINING);
    for (const trainingAction of trainingActions) {
      [...policyActions, ...docActions].forEach(prerequisite => {
        if (!trainingAction.dependencies.includes(prerequisite.id)) {
          trainingAction.dependencies.push(prerequisite.id);
        }
      });
    }
  }

  /**
   * Generate milestones for POAM
   */
  private generateMilestones(actions: RemediationAction[], controlName: string): Milestone[] {
    const milestones: Milestone[] = [];
    const totalActions = actions.length;

    if (totalActions === 0) return milestones;

    // Milestone 1: Critical actions complete (30% of plan)
    const criticalActions = actions.filter(a => a.priority === RemediationPriority.CRITICAL);
    if (criticalActions.length > 0) {
      const criticalDays = criticalActions.reduce((sum, a) => sum + a.estimatedDays, 0);
      const criticalDate = new Date();
      criticalDate.setDate(criticalDate.getDate() + criticalDays);

      milestones.push({
        id: 'm1',
        title: 'Critical Gaps Addressed',
        description: `All critical priority actions completed for ${controlName}`,
        targetDate: criticalDate,
        completedActions: criticalActions.map(a => a.id),
        percentageOfPlan: Math.round((criticalActions.length / totalActions) * 100),
      });
    }

    // Milestone 2: High priority complete (60% of plan)
    const highAndCritical = actions.filter(
      a => a.priority === RemediationPriority.HIGH || a.priority === RemediationPriority.CRITICAL
    );
    if (highAndCritical.length > 0 && highAndCritical.length > criticalActions.length) {
      const highDays = highAndCritical.reduce((sum, a) => sum + a.estimatedDays, 0);
      const highDate = new Date();
      highDate.setDate(highDate.getDate() + highDays);

      milestones.push({
        id: 'm2',
        title: 'High Priority Items Complete',
        description: `All critical and high priority actions completed for ${controlName}`,
        targetDate: highDate,
        completedActions: highAndCritical.map(a => a.id),
        percentageOfPlan: Math.round((highAndCritical.length / totalActions) * 100),
      });
    }

    // Milestone 3: All actions complete (100%)
    const allDays = actions.reduce((sum, a) => sum + a.estimatedDays, 0);
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + allDays);

    milestones.push({
      id: 'm3',
      title: `${controlName} Fully Compliant`,
      description: `All remediation actions completed, control fully implemented`,
      targetDate: completionDate,
      completedActions: actions.map(a => a.id),
      percentageOfPlan: 100,
    });

    return milestones;
  }

  /**
   * Determine target status after plan completion
   */
  private determineTargetStatus(currentStatus: string, actionCount: number): string {
    if (actionCount === 0) return currentStatus;
    if (currentStatus === 'not_implemented') return 'partially_implemented';
    if (currentStatus === 'partially_implemented') return 'implemented';
    return 'implemented';
  }
}
