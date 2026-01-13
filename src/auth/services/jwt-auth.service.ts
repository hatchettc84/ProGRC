import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { SignupDto, LoginDto, ResetPasswordDto, ConfirmResetPasswordDto, SetPasswordDto, UserResponseDto } from '../dto/jwt-auth.dto';
import { AuthResponseDto } from '../dto/jwt-auth.dto';
import { InviteStatus, User } from '../../entities/user.entity';
import { Customer } from '../../entities/customer.entity';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../../notifications/email.service';
import { ResetInternalUserPassword } from '../../user/services/resetPassword.service';
import { PasswordHistory } from '../../entities/auth/passwordHistory.entity';
import { UserRole } from 'src/masterData/userRoles.entity';
import * as crypto from 'crypto';
import { ResetPasswordToken } from 'src/entities/resetPasswordToken.entity';
import { SetTemporaryPasswordDto, SetNewPasswordDto } from '../dto/jwt-auth.dto';
import { MfaService } from './mfa.service';
import { SecurityPolicyService } from './securityPolicy.service';
import { RefreshToken } from 'src/entities/auth/refreshToken.entity';
import { verify } from 'jsonwebtoken';
import { generateS3SignedUrl } from 'src/utils/entity-transformer';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class JwtAuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(PasswordHistory) private passwordHistoryRepo: Repository<PasswordHistory>,
    @InjectRepository(RefreshToken) private refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(ResetPasswordToken) private resetPasswordTokenRepository: Repository<ResetPasswordToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private resetPasswordService: ResetInternalUserPassword,
    private mfaService: MfaService,
    private securityPolicyService: SecurityPolicyService,
    private config: ConfigService,
    private logger: LoggerService,
  ) {}

  async signup(signupDto: SignupDto): Promise<{response: AuthResponseDto, accessToken: string, refreshToken: string}> {
    const existingUser = await this.userRepository.findOne({ where: { email: signupDto.email } });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }
    const role = signupDto.role;

    if(!role){
      throw new BadRequestException('Role is required');
    }

    // Convert string role name to numeric ID
    const roleId = UserRole[role as keyof typeof UserRole];
    if (!roleId) {
      throw new BadRequestException('Invalid role');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const user = this.userRepository.create({
      id: uuidv4(),
      name: signupDto.name,
      email: signupDto.email,
      password_hash: hashedPassword,
      role_id: roleId
    });

    await this.userRepository.save(user);

    const { accessToken, refreshToken } = this.generateToken(user);

    return {response: this.formatAuthResponse(user, null, accessToken), accessToken, refreshToken};
  }

  async login(loginDto: LoginDto): Promise<{response?: AuthResponseDto, accessToken?: string, refreshToken?: string, requiresMfa?: boolean, preAuthToken?: string, mfaChallenge?: any}> {
    const user = await this.userRepository.findOne({ 
      where: { email: ILike(loginDto.email) },
      select: [
        'id', 'name', 'mobile', 'profile_image_key', 'email', 'customer_id',
        'invite_status', 'role_id', 'created_at', 'updated_at', 'deleted',
        'tos_accepted_at', 'is_profile_image_available', 'image_updated_at',
        'temp_profile_image_key', 'password_hash', 'is_locked', 'mfa_enabled',
        'primary_mfa_type', 'last_password_change',
        'password_reset_required', 'reset_password_code', 'reset_password_expires',
        'is_using_temporary_password'
      ],
      relations: ['mfa_devices']
    });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user needs to reset password
    if (user.password_reset_required) {
      throw new BadRequestException({
        message: 'Password reset required',
        code: 'PASSWORD_RESET_REQUIRED',
        userId: user.id
      });
    }

    // Check if user has a password hash
    if (!user.password_hash) {
      throw new UnauthorizedException('Please set your password first');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const customer = await this.customerRepository.findOne({
      where: { id: user.customer_id },
      relations: ['licenseType', 'licenseType.licenseRule', 'customer_csms', 'customer_csms.user', 'created_by_user', 'updated'],
    });
    
    if(user.is_using_temporary_password){
      const preAuthToken = await this.generatePreAuthToken(user);
      const response = this.formatAuthResponse(user, customer, preAuthToken, true);
      return {
        response,
        requiresMfa: true,
        preAuthToken,
      };
    }
    // Check MFA requirements
    const mfaRequired = await this.checkMfaRequirement(user);
    
    if (mfaRequired.requiresMfa) {
      // Generate pre-auth token
      const preAuthToken = await this.generatePreAuthToken(user);
      
      // Generate MFA challenge
      const mfaChallenge = await this.mfaService.generateMfaChallenge(user.id);

      const response = this.formatAuthResponse(user, customer, preAuthToken, true, mfaChallenge);
      
      return {
        response,
        requiresMfa: true,
        preAuthToken,
      };
    }
    
    
    // No MFA required or user is exempt, proceed with normal login
    const { accessToken, refreshToken } = this.generateToken(user);
    const response = this.formatAuthResponse(user, customer, accessToken);
    
    // Add temporary password flag to response
    if (user.is_using_temporary_password) {
      response.isTemporaryPassword = true;
    }

    return {response, accessToken, refreshToken};
  }

  private async checkMfaRequirement(user: User): Promise<{requiresMfa: boolean, policy?: any}> {
    // If user has MFA enabled, it's required
    if (user.mfa_enabled) {
      return { requiresMfa: true };
    }

    // Check if MFA is enforced by policy (if SecurityPolicyService is available)
    try {

      const mfaRequired = await this.securityPolicyService.checkMfaRequirement(user.id);
      if (mfaRequired.mfa_required) {
        return { requiresMfa: true };
      }

      return { requiresMfa: false };
    } catch (error) {
      console.error('Error checking MFA policy:', error);
      return { requiresMfa: false };
    }
  }

  async getMe(userInfo: any): Promise<UserResponseDto> {
    // Log the userInfo payload for debugging (especially for impersonation)
    this.logger.log(`getMe: Received userInfo payload`, {
      email: userInfo?.email || userInfo?.sub,
      userId: userInfo?.userId,
      tenant_id: userInfo?.tenant_id,
      customerId: userInfo?.customerId,
      role_id: userInfo?.role_id,
      hasImpersonateExpTime: !!userInfo?.impersonateExpTime,
      userInfoKeys: Object.keys(userInfo || {})
    });

    // Support both email and sub (JWT standard uses 'sub' for subject)
    const userEmail = userInfo?.email || userInfo?.sub;
    if (!userEmail) {
      this.logger.error('getMe: No email or sub found in userInfo', { userInfo });
      throw new UnauthorizedException('User email not found in token');
    }

    const user = await this.userRepository.findOne({
      where: {
        email: userEmail,
      },
      select: [
        'id', 'name', 'mobile', 'profile_image_key', 'email', 'customer_id',
        'invite_status', 'role_id', 'created_at', 'updated_at', 'deleted',
        'tos_accepted_at', 'is_profile_image_available', 'image_updated_at',
        'temp_profile_image_key', 'password_hash', 'is_locked', 'mfa_enabled',
        'last_password_change', 'primary_mfa_type',
        'password_reset_required', 'reset_password_code', 'reset_password_expires'
      ]
    });
    if (!user) {
      this.logger.error(`getMe: User not found for email: ${userEmail}`);
      throw new UnauthorizedException('User not found');
    }

    // Generate S3 signed URL for profile image using the entity getter
    const profileImageSignedUrl = await generateS3SignedUrl(user.profile_image_key);

    const response: any = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        mobile: user.mobile,
        profile_image_key: profileImageSignedUrl,
        tos_accepted_at: user.tos_accepted_at,
      }
    };

    // Include tenant_id and customerId from JWT payload if present (for impersonation)
    // Always include these from the JWT payload, not from the database user
    // Check multiple possible key names for compatibility
    const tenantId = userInfo?.tenant_id || userInfo?.['tenant_id'] || userInfo?.customerId || userInfo?.['customerId'];
    const customerId = userInfo?.customerId || userInfo?.['customerId'] || userInfo?.tenant_id || userInfo?.['tenant_id'];
    
    if (tenantId) {
      response.user.tenant_id = tenantId;
      this.logger.log(`getMe: Added tenant_id to response: ${tenantId}`, {
        source: userInfo?.tenant_id ? 'tenant_id' : userInfo?.customerId ? 'customerId' : 'fallback',
        userInfoKeys: Object.keys(userInfo || {})
      });
    } else {
      this.logger.warn(`getMe: No tenant_id in JWT payload for user ${userEmail}`, {
        userInfoKeys: Object.keys(userInfo || {}),
        userInfo: userInfo
      });
    }
    
    if (customerId) {
      response.user.customerId = customerId;
      this.logger.log(`getMe: Added customerId to response: ${customerId}`, {
        source: userInfo?.customerId ? 'customerId' : userInfo?.tenant_id ? 'tenant_id' : 'fallback'
      });
    } else {
      this.logger.warn(`getMe: No customerId in JWT payload for user ${userEmail}`, {
        userInfoKeys: Object.keys(userInfo || {}),
        userInfo: userInfo
      });
    }

    // Also include customer_id from database if not in JWT (for non-impersonated users)
    if (!response.user.tenant_id && !response.user.customerId && user.customer_id) {
      response.user.tenant_id = user.customer_id;
      response.user.customerId = user.customer_id;
      this.logger.log(`getMe: Using customer_id from database: ${user.customer_id}`);
    }

    this.logger.log(`getMe: Returning user response`, {
      userId: response.user.id,
      email: response.user.email,
      tenant_id: response.user.tenant_id,
      customerId: response.user.customerId
    });

    return response;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email: ILike(resetPasswordDto.email) } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Use the existing reset password service
    await this.resetPasswordService.resetPasswordUser(
      { userId: user.id },
      user.id
    );
    
    await this.userRepository.update(user.id, { invite_status: InviteStatus.RESET_PASSWORD });
  }

  async confirmResetPassword(confirmResetPasswordDto: ConfirmResetPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ 
      where: { 
        email: ILike(confirmResetPasswordDto.email),
      }
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const resetPasswordToken = await this.resetPasswordTokenRepository.findOne({ 
      where: { 
        user_email: ILike(confirmResetPasswordDto.email),
        token_hash: crypto.createHash('sha256').update(confirmResetPasswordDto.confirmationCode).digest('hex'),
      }
    });

    if (!resetPasswordToken) {
      throw new BadRequestException('Invalid reset code or email');
    }

    if (resetPasswordToken.expires_at < new Date()) {
      throw new BadRequestException('Reset code has expired');
    }

    if (resetPasswordToken.used_at) {
      throw new BadRequestException('Reset code has already been used');
    }

    // Validate password strength
    await this.validatePasswordStrength(confirmResetPasswordDto.newPassword);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(confirmResetPasswordDto.newPassword, 10);

    const recentPasswords = await this.passwordHistoryRepo.find({
      where: { user_id: user.id },
      order: { created_at: 'DESC' },
      take: 3
    });

    for (const history of recentPasswords) {
      if (await bcrypt.compare(confirmResetPasswordDto.newPassword, history.password_hash)) {
        throw new BadRequestException('New password must be different from your last 3 passwords');
      }
    }

    // Update user with new password and clear reset fields
    user.password_hash = hashedPassword;
    user.reset_password_code = null;
    user.reset_password_expires = null;
    user.password_reset_required = false; // Clear the reset required flag
    user.last_password_change = new Date();
    user.is_locked = false;
    user.invite_status = InviteStatus.JOINED;
  

    resetPasswordToken.used_at = new Date();

    // Use transaction to ensure both operations succeed or fail together
    await this.userRepository.manager.transaction(async transactionalEntityManager => {
      // Save user changes
      await transactionalEntityManager.save(User, user);

      // Add to password history
      await transactionalEntityManager.save(PasswordHistory, {
        user_id: user.id,
        password_hash: hashedPassword
      });

      await transactionalEntityManager.save(ResetPasswordToken, resetPasswordToken);
    });
  }

 
  private generateToken(user: User, userInfo: any = null): { accessToken: string, refreshToken: string } {
    const payload = {
      sub: user.email,
      email: user.email,
      role_id: user.role_id,
      customerId: user.customer_id,
      tenant_id: user.customer_id,
      userId: user.id,
      mfa_enabled: user.mfa_enabled,
    };

    if(userInfo && userInfo.impersonateExpTime){
      payload['customerId'] = userInfo.customerId;
      payload['tenant_id'] = userInfo.customerId;
      payload['impersonateExpTime'] = userInfo.impersonateExpTime;
    }
    const privateKey = this.configService.get('ACCESS_TOKEN_SIGNATURE_PRIVATE') || process.env.ACCESS_TOKEN_SIGNATURE_PRIVATE;
    if (!privateKey) {
      throw new Error('ACCESS_TOKEN_SIGNATURE_PRIVATE is not configured');
    }
    const accessToken = this.jwtService.sign(payload, {
      privateKey: privateKey,
      algorithm: 'RS256',
      issuer: 'progrc-auth',
      expiresIn: '4h',
      audience: 'progrc-auth',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SIGNATURE'),
      algorithm: 'HS256',
      issuer: 'progrc-auth',
      audience: 'progrc-auth-refresh',
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private formatAuthResponse(user: User, customer: Customer | null, accessToken: string, mfaRequired: boolean = false, mfaChallenge: any = {}): AuthResponseDto {
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        mobile: user.mobile,
        profile_image_key: user.profile_image_key,
        tos_accepted_at: user.tos_accepted_at,
        is_using_temporary_password: user.is_using_temporary_password,
      },
      organization: customer ? {
        id: customer.id,
        logo_image_key: customer.logo_image_key,
        organization_name: customer.organization_name,
        license_type: customer.license_type,
        is_onboarding_complete: customer.is_onboarding_complete,
        created_at: customer.created_at,
        created_by: customer.created_by_user ? {
          name: customer.created_by_user.name,
          email: customer.created_by_user.email,
        } : null,
        license_type_id: customer.license_type_id,
        license_type_data: customer.licenseType ? {
          id: customer.licenseType.id,
          name: customer.licenseType.name,
          created_at: customer.licenseType.created_at,
          updated_at: customer.licenseType.updated_at,
          licenseRule: customer.licenseType.licenseRule,
        } : undefined,
        license_start_date: customer.license_start_date,
        license_end_date: customer.license_end_date,
        csms: customer.customer_csms?.map(csm => ({
          id: csm.user_id,
          created_at: csm.created_at,
          name: csm.user.name,
          email: csm.user.email,
        })),
      } : undefined,
      accessToken,
      mfa_required: mfaRequired,
      mfa_challenge: mfaChallenge,
    };
  }

  private async validatePasswordStrength(password: string): Promise<void> {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
    if (!hasUpperCase) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
      throw new BadRequestException('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
      throw new BadRequestException('Password must contain at least one special character');
    }
  }

  async refreshToken(userInfo: any): Promise<{accessToken: string, refreshToken: string}> {
    this.logger.log(`refreshToken: Received userInfo`, {
      email: userInfo?.email || userInfo?.sub,
      userId: userInfo?.userId,
      tenant_id: userInfo?.tenant_id,
      customerId: userInfo?.customerId,
      hasImpersonateExpTime: !!userInfo?.impersonateExpTime,
      userInfoKeys: Object.keys(userInfo || {})
    });
    
    const user = await this.userRepository.findOne({ 
      where: { email: ILike(userInfo.email || userInfo.sub) },
      select: [
        'id', 'name', 'mobile', 'email', 'customer_id','role_id', 'mfa_enabled', 'primary_mfa_type'
      ]
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // CRITICAL: Preserve impersonation context from refresh token payload
    // If userInfo has tenant_id/customerId (from impersonation), use those instead of user.customer_id
    const impersonationContext = {
      ...userInfo,
      // Ensure we preserve tenant_id and customerId if they exist in the refresh token
      tenant_id: userInfo.tenant_id || userInfo.customerId || user.customer_id,
      customerId: userInfo.customerId || userInfo.tenant_id || user.customer_id,
      // Preserve impersonateExpTime if it exists
      impersonateExpTime: userInfo.impersonateExpTime
    };
    
    this.logger.log(`refreshToken: Preserving impersonation context`, {
      tenant_id: impersonationContext.tenant_id,
      customerId: impersonationContext.customerId,
      hasImpersonateExpTime: !!impersonationContext.impersonateExpTime
    });

    const { accessToken, refreshToken } = this.generateToken(user, impersonationContext);
    
    this.logger.log(`refreshToken: Generated new tokens with impersonation context`, {
      tenant_id: impersonationContext.tenant_id,
      customerId: impersonationContext.customerId
    });
    
    return {accessToken, refreshToken};
  }

  async setTemporaryPassword(setTemporaryPasswordDto: SetTemporaryPasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email: ILike(setTemporaryPasswordDto.email) } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Hash the temporary password
    const hashedPassword = await bcrypt.hash(setTemporaryPasswordDto.temporaryPassword, 10);

    // Update user with temporary password
    await this.userRepository.update(user.id, {
      password_hash: hashedPassword,
      is_using_temporary_password: true,
      password_reset_required: false,
      is_locked: false,
      invite_status: InviteStatus.JOINED
    });

    // Send email with temporary password
    await this.emailService.sendTemporaryPasswordEmail(
      user.email,
      setTemporaryPasswordDto.temporaryPassword
    );
  }

  async setNewPassword(setNewPasswordDto: SetNewPasswordDto, userInfo: any): Promise<void> {
    const user = await this.userRepository.findOne({ 
      where: { email: ILike(setNewPasswordDto.email) }
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user is using temporary password
    if (!user.is_using_temporary_password) {
      throw new BadRequestException('User is not using a temporary password');
    }

    // Get the current password hash to compare
    const currentPasswordHash = user.password_hash;

    // Check if new password is same as temporary password
    const isSameAsTemporaryPassword = await bcrypt.compare(setNewPasswordDto.newPassword, currentPasswordHash);
    if (isSameAsTemporaryPassword) {
      throw new BadRequestException('New password cannot be the same as temporary password');
    }

    // Validate password strength
    await this.validatePasswordStrength(setNewPasswordDto.newPassword);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(setNewPasswordDto.newPassword, 10);

    const recentPasswords = await this.passwordHistoryRepo.find({
      where: { user_id: user.id },
      order: { created_at: 'DESC' },
      take: 3
    });

    for (const history of recentPasswords) {
      if (await bcrypt.compare(setNewPasswordDto.newPassword, history.password_hash)) {
        throw new BadRequestException('New password must be different from your last 3 passwords');
      }
    }

    // Update user with new password
    await this.userRepository.manager.transaction(async transactionalEntityManager => {
      // Update user
      await transactionalEntityManager.update(User, user.id, {
        password_hash: hashedPassword,
        is_using_temporary_password: false,
        last_password_change: new Date()
      });

      // Add to password history
      await transactionalEntityManager.save(PasswordHistory, {
        user_id: user.id,
        password_hash: hashedPassword
      });
    });
  }

  async registerSuperAdminUser(body: any) {
    const { email, password } = body;
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new BadRequestException('User with this email already exists');
    }

    await this.validatePasswordStrength(password);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      id: uuidv4(),
      name: 'Super Admin',
      email,
      password_hash: hashedPassword,
      role_id: UserRole.SuperAdmin,
      invite_status: InviteStatus.JOINED,
      is_locked: false,
      is_using_temporary_password: false,
      password_reset_required: false,
      last_password_change: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.userRepository.save(newUser);

    return {
      message: 'User created successfully!',
    };
  }

  async revokeRefreshToken(token: string): Promise<void> {
    try {
      await this.refreshTokenRepo.update(
        { token: token },
        { revoked_at: new Date() }
      );
    } catch (error) {
      console.warn('Error revoking refresh token:', error);
    }
  }

  // === MFA Methods (delegating to MfaService) ===

  async verifyTotpCode(userId: string, code: string, deviceId?: string): Promise<boolean> {
    return await this.mfaService.verifyTotpCode(userId, code, deviceId);
  }

  async verifyEmailOtp(userId: string, code: string, purpose: string = 'LOGIN'): Promise<boolean> {
    return await this.mfaService.verifyEmailOtp(userId, code, purpose);
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    return await this.mfaService.verifyBackupCode(userId, code);
  }

  async sendEmailOtp(userId: string, purpose: string = 'LOGIN'): Promise<void> {
    return await this.mfaService.sendEmailOtp(userId, purpose);
  }

  async disableMfaForUser(userId: string, confirmationCode: string): Promise<void> {
    return await this.mfaService.disableMfaForUser(userId, confirmationCode);
  }

  async generateTokens(user: User): Promise<{ accessToken: string, refreshToken: string }> {
    return this.generateToken(user);
  }

  async generatePreAuthToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      mfa_required: true,
      mfa_enabled: user.mfa_enabled,
      role_id: user.role_id,
      customerId: user.customer_id,
      tenant_id: user.customer_id,
      iat: Math.floor(Date.now() / 1000),
    };

    const privateKey = this.configService.get('ACCESS_TOKEN_SIGNATURE_PRIVATE') || process.env.ACCESS_TOKEN_SIGNATURE_PRIVATE;
    if (!privateKey) {
      throw new Error('ACCESS_TOKEN_SIGNATURE_PRIVATE is not configured');
    }
    return this.jwtService.sign(payload, {
      privateKey: privateKey,
      algorithm: 'RS256',
      issuer: 'progrc-auth',
      audience: 'progrc-mfa',
      expiresIn: '30m', // Pre-auth tokens should expire quickly
    });
  }
} 