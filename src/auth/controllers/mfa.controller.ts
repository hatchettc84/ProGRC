import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  Request, 
  UseGuards, 
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { MfaService } from '../services/mfa.service';
import { SecurityPolicyService } from '../services/securityPolicy.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MfaAuthGuard } from '../guards/mfa-auth.guard';
import { MfaOrJwtAuthGuard } from '../guards/mfa-or-jwt-auth.guard';
import { TransformInterceptor } from '../../interceptors/transform.interceptor';
import { StandardResponse } from '../../common/dto/standardResponse.dto';
import { Roles } from '../../decorators/roles.decorator';
import { UserRole } from '../../masterData/userRoles.entity';
import { 
  MfaDeviceType, 
  PolicyScope, 
  MfaEnforcementRules 
} from '../../entities/auth/mfa.types';
import {
  InitiateMfaSetupDto,
  CompleteTotpSetupDto,
  CompleteEmailSetupDto,
  CompletePasskeySetupDto,
  VerifyTotpDto,
  VerifyEmailOtpDto,
  VerifyBackupCodeDto,
  VerifyPasskeyDto,
  GenerateChallengeDto,
  SendEmailOtpDto,
  CreateSecurityPolicyDto,
  UpdateSecurityPolicyDto,
  DisableMfaDto,
  EnableMfaDto,
  MfaSetupResponseDto,
  MfaDeviceDto,
  MfaStatusDto,
  MfaChallengeDto
} from '../dto/mfa.dto';

/**
 * MFA (Multi-Factor Authentication) Controller
 * 
 * Provides endpoints for managing MFA devices, setup, and policies.
 * 
 * DEPRECATION NOTICE:
 * Some endpoints in this controller are marked as deprecated due to duplicate APIs
 * that were created during the migration from auth.controller.ts. 
 * 
 * Deprecated endpoints (will be removed in future versions):
 * - GET /status (duplicate) -> Use the primary GET /status instead
 * - GET /devices (duplicate) -> Use the primary GET /devices instead  
 * - PUT /devices/:deviceId/primary (duplicate) -> Use PUT /device/:deviceId/primary instead
 * - DELETE /devices/:deviceId (duplicate) -> Use DELETE /device/:deviceId instead
 * - POST /backup-codes/regenerate (duplicate) -> Use POST /backup-codes instead
 * - GET /policies (duplicate) -> Use the primary GET /policies instead
 */
@ApiTags('MFA')
@Controller('auth/mfa')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth('JWT-auth')
export class MfaController {
  constructor(
    private readonly mfaService: MfaService,
    private readonly securityPolicyService: SecurityPolicyService,
  ) {}
  
  // === MFA Setup APIs ===
  @Get('status')
  @UseGuards(MfaOrJwtAuthGuard)
  @ApiOperation({ summary: 'Get user MFA status and available options' })
  async getMfaStatus(@Request() req) {
    const user = req.user_data;
    
    const devices = await this.mfaService.getUserDevices(user.userId);
    const setupSessions = await this.mfaService.getActiveSetupSessions(user.userId);
    const policy = await this.securityPolicyService.getMfaPolicy(user.userId);
    const userMfaStatus = await this.mfaService.getUserMfaStatus(user.userId);
    
    return StandardResponse.success('MFA status retrieved', {
      mfa_enabled: userMfaStatus.mfa_enabled,
      devices,
      backup_codes_available: userMfaStatus.backup_codes_available,
      available_types: [MfaDeviceType.TOTP, MfaDeviceType.EMAIL],
      setup_sessions: setupSessions,
      policy,
    });
  }

  @Post('setup/initiate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Initiate MFA device setup',
    description: 'Starts the setup process for a new MFA device'
  })
  @ApiBody({ type: InitiateMfaSetupDto })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA setup initiated successfully',
    type: MfaSetupResponseDto
  })
  async initiateMfaSetup(@Request() req, @Body() setupDto: InitiateMfaSetupDto): Promise<StandardResponse<MfaSetupResponseDto>> {
    const userId = req.user_data?.userId;
    const setup = await this.mfaService.initiateMfaSetup(userId, setupDto.device_type, setupDto.device_name);
    return StandardResponse.success('MFA setup initiated successfully', setup);
  }

  @Post('setup/totp/configure')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Configure TOTP device' })
  async configureTotpMfa(@Request() req, @Body() body: { session_id: string }) {
    const user = req.user_data;
    const result = await this.mfaService.configureTotpDevice(user.userId, body.session_id);
    return StandardResponse.success('TOTP configuration ready', result);
  }

  @Post('setup/totp/verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify and complete TOTP setup' })
  async verifyTotpSetup(@Request() req, @Body() body: { 
    session_id: string, 
    code: string 
  }) {
    const user = req.user_data;
    const result = await this.mfaService.completeTotpSetup(user.userId, body.session_id, body.code);
    return StandardResponse.success('TOTP device configured successfully', result);
  }

  @Post('setup/email/configure')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Configure Email MFA' })
  async configureEmailMfa(@Request() req, @Body() body: { session_id: string }) {
    const user = req.user_data;
    const result = await this.mfaService.configureEmailDevice(user.userId, body.session_id);
    return StandardResponse.success('Email MFA configuration initiated', result);
  }

  @Post('setup/email/verify')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify email MFA setup' })
  async verifyEmailSetup(@Request() req, @Body() body: { 
    session_id: string, 
    code: string 
  }) {
    const user = req.user_data;
    const result = await this.mfaService.completeEmailSetup(user.userId, body.session_id, body.code);
    return StandardResponse.success('Email MFA configured successfully', result);
  }

  @Post('setup/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel MFA setup session' })
  async cancelMfaSetup(@Request() req, @Body() body: { session_id: string }) {
    const user = req.user_data;
    await this.mfaService.cancelSetupSession(user.userId, body.session_id);
    return StandardResponse.success('MFA setup session cancelled');
  }

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Enable MFA for user',
    description: 'Enables MFA for the user with specified primary device'
  })
  @ApiBody({ type: EnableMfaDto })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA enabled successfully',
    type: StandardResponse
  })
  async enableMfa(@Request() req, @Body() enableDto: EnableMfaDto): Promise<StandardResponse<any>> {
    const userId = req.user_data?.userId;
    const result = await this.mfaService.enableMfaForUser(
      userId, 
      enableDto.primary_device_id, 
      enableDto.generate_backup_codes
    );
    return StandardResponse.success('MFA enabled successfully', result);
  }

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Disable MFA for user',
    description: 'Disables MFA for the user with confirmation'
  })
  @ApiBody({ type: DisableMfaDto })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA disabled successfully',
    type: StandardResponse
  })
  async disableMfa(@Request() req, @Body() disableDto: DisableMfaDto): Promise<StandardResponse<any>> {
    const userId = req.user_data?.userId;
    await this.mfaService.disableMfaForUser(userId, disableDto.confirmation_code);
    return StandardResponse.success('MFA disabled successfully');
  }

  @Get('devices')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user MFA devices' })
  async getUserMfaDevices(@Request() req) {
    const user = req.user_data;
    const devices = await this.mfaService.getUserDevices(user.userId);
    return StandardResponse.success('MFA devices retrieved', devices);
  }

  @Put('device/:deviceId/primary')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Set device as primary MFA method' })
  async setPrimaryMfaDevice(@Request() req, @Param('deviceId') deviceId: string) {
    const user = req.user_data;
    await this.mfaService.setPrimaryDevice(user.userId, deviceId);
    return StandardResponse.success('Primary MFA device updated');
  }

  @Delete('device/:deviceId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove MFA device' })
  async removeMfaDevice(@Request() req, @Param('deviceId') deviceId: string) {
    const user = req.user_data;
    await this.mfaService.removeDevice(user.userId, deviceId);
    return StandardResponse.success('MFA device removed');
  }

  @Post('backup-codes/generate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Generate backup codes',
    description: 'Generates new backup codes for MFA recovery'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Backup codes generated successfully',
    type: StandardResponse
  })
  async generateBackupCodes(@Request() req): Promise<StandardResponse<any>> {
    const userId = req.user_data?.userId;
    const backupCodes = await this.mfaService.generateBackupCodes(userId);
    return StandardResponse.success('Backup codes generated successfully', { backup_codes: backupCodes });
  }

  @Get('challenge')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get MFA challenge for authentication' })
  async getMfaChallenge(@Request() req, @Query('device_id') deviceId?: string) {
    const user = req.user_data;
    const challenge = await this.mfaService.generateMfaChallenge(user.userId, deviceId);
    return StandardResponse.success('MFA challenge generated', challenge);
  }

  @Post('send-email-otp')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Send email OTP for authentication' })
  async sendEmailOtp(@Request() req, @Query('purpose') purpose?: string) {
    const user = req.user_data;
    purpose = ['LOGIN', 'DISABLE', 'ENABLE'].includes(purpose) ? purpose : 'LOGIN';
    await this.mfaService.sendEmailOtp(user.userId, purpose);
    return StandardResponse.success('Email OTP sent successfully');
  }

  // === MFA Enforcement APIs (Admin/CSM Only) ===
  
  @Post('enforce')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Force MFA for users' })
  @Roles(UserRole.OrgAdmin, UserRole.CSM, UserRole.SuperAdmin)
  async enforceMfa(@Request() req, @Body() body: {
    scope: PolicyScope,
    scope_id?: string,
    rules: MfaEnforcementRules,
    target_users?: string[]
  }) {
    const user = req.user_data;
    const policy = await this.securityPolicyService.createMfaPolicy(user.userId, body);
    return StandardResponse.success('MFA enforcement policy created', policy);
  }

  @Get('policies')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get MFA policies' })
  @Roles(UserRole.OrgAdmin, UserRole.CSM, UserRole.SuperAdmin)
  async getMfaPolicies(@Request() req, @Query() query: {
    scope?: PolicyScope,
    scope_id?: string
  }) {
    const user = req.user_data;
    const policies = await this.securityPolicyService.getMfaPolicies(user.userId, query);
    return StandardResponse.success('MFA policies retrieved', policies);
  }

  @Put('policy/:policyId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update MFA policy' })
  @Roles(UserRole.OrgAdmin, UserRole.CSM, UserRole.SuperAdmin)
  async updateMfaPolicy(@Request() req, @Param('policyId') policyId: string, @Body() body: any) {
    const user = req.user_data;
    const policy = await this.securityPolicyService.updateMfaPolicy(user.userId, policyId, body);
    return StandardResponse.success('MFA policy updated', policy);
  }

  @Delete('policy/:policyId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete MFA policy' })
  @Roles(UserRole.OrgAdmin, UserRole.CSM, UserRole.SuperAdmin)
  async deleteMfaPolicy(@Request() req, @Param('policyId') policyId: string) {
    const user = req.user_data;
    await this.securityPolicyService.deleteMfaPolicy(user.userId, policyId);
    return StandardResponse.success('MFA policy deleted');
  }

  @Get('requirement')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Check MFA requirement',
    description: 'Checks if MFA is required for the current user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA requirement checked',
    type: StandardResponse
  })
  async checkMfaRequirement(@Request() req): Promise<StandardResponse<any>> {
    const userId = req.user_data?.userId;
    const requirement = await this.securityPolicyService.checkMfaRequirement(userId);
    return StandardResponse.success('MFA requirement checked', requirement);
  }

  // === MFA Status and Management Endpoints ===

  // @Get('status')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ 
  //   summary: 'Get MFA status for current user',
  //   description: 'Returns the current MFA configuration and enabled devices for the user',
  //   deprecated: true
  // })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'MFA status retrieved successfully (DEPRECATED: Use GET /auth/mfa/status instead)',
  //   type: MfaStatusDto
  // })
  /**
   * @deprecated Use getMfaStatus() instead. This endpoint will be removed in future versions.
   */
  async getMfaStatusCurrentUser(@Request() req): Promise<StandardResponse<MfaStatusDto>> {
    const userId = req.user_data?.userId;
    const status = await this.mfaService.getUserMfaStatus(userId);
    return StandardResponse.success('MFA status retrieved successfully', status);
  }

  // @Get('devices')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ 
  //   summary: 'List all MFA devices for current user',
  //   description: 'Returns a list of all configured MFA devices for the user',
  //   deprecated: true
  // })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'MFA devices retrieved successfully (DEPRECATED: Use GET /auth/mfa/devices instead)',
  //   type: [MfaDeviceDto]
  // })
  /**
   * @deprecated Use getUserMfaDevices() instead. This endpoint will be removed in future versions.
   */
  async listMfaDevices(@Request() req): Promise<StandardResponse<MfaDeviceDto[]>> {
    const userId = req.user_data?.userId;
    const devices = await this.mfaService.listUserDevices(userId);
    return StandardResponse.success('MFA devices retrieved successfully', devices);
  }

  // @Put('devices/:deviceId/primary')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ 
  //   summary: 'Set a device as primary MFA device',
  //   description: 'Sets the specified device as the primary MFA device for the user',
  //   deprecated: true
  // })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'Primary device updated successfully (DEPRECATED: Use PUT /auth/mfa/device/:deviceId/primary instead)',
  //   type: StandardResponse
  // })
  /**
   * @deprecated Use setPrimaryMfaDevice() instead. This endpoint will be removed in future versions.
   */
  async setPrimaryDevice(@Request() req, @Param('deviceId') deviceId: string): Promise<StandardResponse<any>> {
    const userId = req.user_data?.userId;
    await this.mfaService.setPrimaryDevice(userId, deviceId);
    return StandardResponse.success('Primary device updated successfully');
  }

  // @Delete('devices/:deviceId')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ 
  //   summary: 'Remove an MFA device',
  //   description: 'Removes the specified MFA device from the user account',
  //   deprecated: true
  // })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'Device removed successfully (DEPRECATED: Use DELETE /auth/mfa/device/:deviceId instead)',
  //   type: StandardResponse
  // })
  /**
   * @deprecated Use removeMfaDevice() instead. This endpoint will be removed in future versions.
   */
  async removeDevice(@Request() req, @Param('deviceId') deviceId: string): Promise<StandardResponse<any>> {
    const userId = req.user_data?.userId;
    await this.mfaService.removeDevice(userId, deviceId);
    return StandardResponse.success('Device removed successfully');
  }

  // @Post('backup-codes/regenerate')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ 
  //   summary: 'Regenerate backup codes',
  //   description: 'Generates new backup codes and invalidates old ones',
  //   deprecated: true
  // })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'Backup codes regenerated successfully (DEPRECATED: Use POST /auth/mfa/backup-codes instead)',
  //   type: StandardResponse
  // })
  /**
   * @deprecated Use generateBackupCodes() instead. This endpoint will be removed in future versions.
   */
  async regenerateBackupCodes(@Request() req): Promise<StandardResponse<any>> {
    const userId = req.user_data?.userId;
    
    // Invalidate old backup codes
    await this.mfaService.invalidateBackupCodes(userId);
    
    // Generate new ones
    const backupCodes = await this.mfaService.generateBackupCodes(userId);
    
    return StandardResponse.success('Backup codes regenerated successfully', { backup_codes: backupCodes });
  }

  @Post('challenge')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Generate MFA challenge',
    description: 'Generates an MFA challenge for authentication'
  })
  @ApiBody({ type: GenerateChallengeDto })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA challenge generated successfully',
    type: MfaChallengeDto
  })
  async generateMfaChallenge(@Request() req, @Body() challengeDto: GenerateChallengeDto): Promise<StandardResponse<MfaChallengeDto>> {
    const userId = req.user_data?.userId;
    const challenge = await this.mfaService.generateMfaChallenge(userId, challengeDto.device_id);
    return StandardResponse.success('MFA challenge generated successfully', challenge);
  }

  @Get('recovery-options')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get MFA recovery options',
    description: 'Returns available recovery options if user loses access to MFA devices'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Recovery options retrieved successfully',
    type: StandardResponse
  })
  async getRecoveryOptions(@Request() req): Promise<StandardResponse<any>> {
    const userId = req.user_data?.userId;
    const options = await this.mfaService.getRecoveryOptions(userId);
    return StandardResponse.success('Recovery options retrieved successfully', options);
  }

  // === Admin/Policy Management Endpoints ===

  // @Roles(UserRole.SuperAdmin, UserRole.CSM, UserRole.OrgAdmin)
  // @Get('policies')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ 
  //   summary: 'List MFA policies',
  //   description: 'Returns MFA enforcement policies (Admin only)',
  //   deprecated: true
  // })
  // @ApiResponse({ 
  //   status: 200, 
  //   description: 'MFA policies retrieved successfully (DEPRECATED: Use existing GET /auth/mfa/policies endpoint instead)',
  //   type: StandardResponse
  // })
  /**
   * @deprecated Use getMfaPolicies() instead. This endpoint will be removed in future versions.
   */
  async listMfaPolicies(@Request() req): Promise<StandardResponse<any>> {
    const userRole = req.user_data?.role_id;
    const customerId = req.user_data?.customerId;
    
    const policies = await this.securityPolicyService.getUserAccessiblePolicies(userRole, customerId);
    return StandardResponse.success('MFA policies retrieved successfully', policies);
  }

  @Roles(UserRole.SuperAdmin, UserRole.CSM, UserRole.OrgAdmin)
  @Post('policies')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create MFA enforcement policy',
    description: 'Creates a new MFA enforcement policy (Admin only)'
  })
  @ApiBody({ type: CreateSecurityPolicyDto })
  @ApiResponse({ 
    status: 201, 
    description: 'MFA policy created successfully',
    type: StandardResponse
  })
  async createMfaPolicy(@Request() req, @Body() createPolicyDto: CreateSecurityPolicyDto): Promise<StandardResponse<any>> {
    const userId = req.user_data?.userId;
    const userRole = req.user_data?.role_id;
    const customerId = req.user_data?.customerId;
    
    const policy = await this.securityPolicyService.createPolicy({
      ...createPolicyDto,
    }, userId);
    
    return StandardResponse.success('MFA policy created successfully', policy);
  }

  @Roles(UserRole.SuperAdmin, UserRole.CSM)
  @Get('users/:userId/status')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Get MFA status for specific user',
    description: 'Returns MFA status for any user (SuperAdmin/CSM only)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User MFA status retrieved successfully',
    type: MfaStatusDto
  })
  async getUserMfaStatus(@Param('userId') userId: string): Promise<StandardResponse<MfaStatusDto>> {
    const status = await this.mfaService.getUserMfaStatus(userId);
    return StandardResponse.success('User MFA status retrieved successfully', status);
  }

  @Roles(UserRole.SuperAdmin, UserRole.CSM)
  @Post('users/:userId/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Force disable MFA for user',
    description: 'Forcibly disables MFA for a user (SuperAdmin/CSM only)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'MFA disabled successfully',
    type: StandardResponse
  })
  async forceDisableMfa(@Param('userId') userId: string, @Request() req): Promise<StandardResponse<any>> {
    const adminUserId = req.user_data?.userId;
    await this.mfaService.forceDisableMfaForUser(userId, adminUserId);
    return StandardResponse.success('MFA disabled successfully for user');
  }

  @Get('email-change-validation')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validate email change for MFA users',
    description: 'Checks if user can change their email address when they have Email MFA enabled'
  })
  @ApiQuery({ name: 'new_email', description: 'New email address to validate', required: true })
  @ApiResponse({ 
    status: 200, 
    description: 'Email change validation result',
    type: StandardResponse
  })
  async validateEmailChangeForMfa(@Request() req, @Query('new_email') newEmail: string): Promise<StandardResponse<any>> {
    const userId = req.user_data?.userId;
    
    if (!newEmail) {
      throw new BadRequestException('new_email query parameter is required');
    }

    const validation = await this.mfaService.validateEmailChangeForMfa(userId, newEmail);
    return StandardResponse.success('Email change validation completed', validation);
  }
} 