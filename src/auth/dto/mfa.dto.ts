import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean, IsUUID, IsEmail, MinLength, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MfaDeviceType, MfaSetupStatus, PolicyScope, MfaEnforcementLevel } from '../../entities/auth/mfa.types';

// === Setup DTOs ===

export class InitiateMfaSetupDto {
  @ApiProperty({ 
    description: 'Type of MFA device to setup',
    enum: MfaDeviceType,
    example: MfaDeviceType.TOTP
  })
  @IsEnum(MfaDeviceType)
  @IsNotEmpty()
  device_type: MfaDeviceType;

  @ApiProperty({ 
    description: 'Name for the MFA device',
    example: 'My iPhone Authenticator'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(50)
  device_name: string;
}

export class CompleteTotpSetupDto {
  @ApiProperty({ 
    description: 'Setup session ID',
    example: 'session_12345'
  })
  @IsString()
  @IsNotEmpty()
  session_id: string;

  @ApiProperty({ 
    description: 'TOTP verification code from authenticator app',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}

export class CompleteEmailSetupDto {
  @ApiProperty({ 
    description: 'Setup session ID',
    example: 'session_12345'
  })
  @IsString()
  @IsNotEmpty()
  session_id: string;

  @ApiProperty({ 
    description: 'Email verification code',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  code: string;
}

export class CompletePasskeySetupDto {
  @ApiProperty({ 
    description: 'Setup session ID',
    example: 'session_12345'
  })
  @IsString()
  @IsNotEmpty()
  session_id: string;

  @ApiProperty({ 
    description: 'WebAuthn credential response',
    type: 'object',
    additionalProperties: true
  })
  @IsNotEmpty()
  credential: any;
}

// === Verification DTOs ===

export class VerifyTotpDto {
  @ApiProperty({ 
    description: 'TOTP verification code',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @ApiPropertyOptional({ 
    description: 'Specific device ID to verify against',
    example: 'device_12345'
  })
  @IsString()
  @IsOptional()
  device_id?: string;
}

export class VerifyEmailOtpDto {
  @ApiProperty({ 
    description: 'Email OTP verification code',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(6)
  code: string;

  @ApiPropertyOptional({ 
    description: 'Purpose of the OTP verification',
    example: 'LOGIN'
  })
  @IsString()
  @IsOptional()
  purpose?: string;
}

export class VerifyBackupCodeDto {
  @ApiProperty({ 
    description: 'Backup code for verification',
    example: 'ABCD-1234-EFGH-5678'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(25)
  code: string;
}

export class VerifyPasskeyDto {
  @ApiProperty({ 
    description: 'WebAuthn authentication response',
    type: 'object',
    additionalProperties: true
  })
  @IsNotEmpty()
  credential: any;

  @ApiPropertyOptional({ 
    description: 'Challenge ID from MFA challenge',
    example: 'challenge_12345'
  })
  @IsString()
  @IsOptional()
  challenge_id?: string;
}

// === Device Management DTOs ===

export class GenerateChallengeDto {
  @ApiPropertyOptional({ 
    description: 'Specific device ID to generate challenge for',
    example: 'device_12345'
  })
  @IsString()
  @IsOptional()
  device_id?: string;
}

export class SendEmailOtpDto {
  @ApiPropertyOptional({ 
    description: 'Purpose of the email OTP',
    example: 'LOGIN',
    default: 'LOGIN'
  })
  @IsString()
  @IsOptional()
  purpose?: string;
}

// === Policy Management DTOs ===

export class CreateSecurityPolicyDto {
  @ApiProperty({ 
    description: 'Name of the security policy',
    example: 'Organization MFA Policy'
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  policy_name: string;

  @ApiProperty({ 
    description: 'Policy scope',
    enum: PolicyScope,
    example: PolicyScope.ORGANIZATION
  })
  @IsEnum(PolicyScope)
  scope: PolicyScope;

  @ApiProperty({ 
    description: 'MFA enforcement level',
    enum: MfaEnforcementLevel,
    example: MfaEnforcementLevel.REQUIRED
  })
  @IsEnum(MfaEnforcementLevel)
  enforcement_level: MfaEnforcementLevel;

  @ApiPropertyOptional({ 
    description: 'Allowed MFA types',
    type: [String],
    enum: MfaDeviceType,
    example: [MfaDeviceType.TOTP, MfaDeviceType.PASSKEY]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(MfaDeviceType, { each: true })
  allowed_mfa_types?: MfaDeviceType[];

  @ApiPropertyOptional({ 
    description: 'Grace period in hours',
    example: 24
  })
  @IsOptional()
  grace_period_hours?: number;

  @ApiPropertyOptional({ 
    description: 'Target entity ID (organization, role, or user)',
    example: 'org_12345'
  })
  @IsString()
  @IsOptional()
  target_entity_id?: string;

  @ApiPropertyOptional({ 
    description: 'Policy description',
    example: 'Requires all organization members to enable MFA'
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

export class UpdateSecurityPolicyDto {
  @ApiPropertyOptional({ 
    description: 'Name of the security policy',
    example: 'Updated Organization MFA Policy'
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  policy_name?: string;

  @ApiPropertyOptional({ 
    description: 'MFA enforcement level',
    enum: MfaEnforcementLevel,
    example: MfaEnforcementLevel.RECOMMENDED
  })
  @IsEnum(MfaEnforcementLevel)
  @IsOptional()
  enforcement_level?: MfaEnforcementLevel;

  @ApiPropertyOptional({ 
    description: 'Allowed MFA types',
    type: [String],
    enum: MfaDeviceType
  })
  @IsOptional()
  @IsArray()
  @IsEnum(MfaDeviceType, { each: true })
  allowed_mfa_types?: MfaDeviceType[];

  @ApiPropertyOptional({ 
    description: 'Grace period in hours'
  })
  @IsOptional()
  grace_period_hours?: number;

  @ApiPropertyOptional({ 
    description: 'Whether the policy is active'
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ 
    description: 'Policy description'
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

// === User Management DTOs ===

export class DisableMfaDto {
  @ApiProperty({ 
    description: 'Confirmation code (TOTP, email OTP, or backup code)',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  confirmation_code: string;
}

export class EnableMfaDto {
  @ApiProperty({ 
    description: 'Primary device ID to use for MFA',
    example: 'device_12345'
  })
  @IsString()
  @IsOptional()
  primary_device_id: string;

  @ApiPropertyOptional({ 
    description: 'Whether to generate backup codes',
    example: true,
    default: true
  })
  @IsBoolean()
  @IsOptional()
  generate_backup_codes?: boolean;
}

// === Response DTOs ===

export class MfaSetupResponseDto {
  @ApiProperty({ description: 'Setup session ID' })
  session_id: string;

  @ApiProperty({ description: 'Device type being set up' })
  device_type: string;

  @ApiProperty({ description: 'Setup data (TOTP secret, QR code, etc.)' })
  setup_data: any;

  @ApiProperty({ description: 'Instructions for completing setup' })
  instructions: string;

  @ApiProperty({ description: 'Expiration time for setup session' })
  expires_at: Date;
}

export class MfaDeviceDto {
  @ApiProperty({ description: 'Device ID' })
  id: string;

  @ApiProperty({ description: 'Device name' })
  name: string;

  @ApiProperty({ description: 'Device type' })
  type: string;

  @ApiProperty({ description: 'Whether this is the primary device' })
  is_primary: boolean;

  @ApiProperty({ description: 'When the device was created' })
  created_at: Date;

  @ApiProperty({ description: 'When the device was last used' })
  last_used_at: Date;

  @ApiProperty({ description: 'Device metadata' })
  metadata: any;
}

export class MfaStatusDto {
  @ApiProperty({ description: 'Whether MFA is enabled' })
  mfa_enabled: boolean;

  @ApiProperty({ description: 'Primary MFA type' })
  primary_mfa_type: string;

  @ApiProperty({ description: 'Number of configured devices' })
  devices_count: number;

  @ApiProperty({ description: 'Primary device information' })
  primary_device: any;

  @ApiProperty({ description: 'Number of available backup codes' })
  backup_codes_available: number;

  @ApiProperty({ description: 'MFA enforcement information' })
  enforcement: any;

  @ApiProperty({ description: 'Whether MFA setup is required' })
  setup_required: boolean;
}

export class MfaChallengeDto {
  @ApiProperty({ description: 'Challenge ID' })
  challenge_id: string;

  @ApiProperty({ description: 'Primary device for authentication' })
  primary_device: any;

  @ApiProperty({ description: 'Alternative devices available' })
  alternative_devices: any[];

  @ApiProperty({ description: 'Fallback authentication options' })
  fallback_options: any[];

  @ApiProperty({ description: 'Masked email for fallback' })
  email_masked: string;

  @ApiProperty({ description: 'Challenge expiration time' })
  expires_at: Date;
} 