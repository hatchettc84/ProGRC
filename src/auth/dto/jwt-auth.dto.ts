import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class SignupDto {
  @IsString()
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  role?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;
}

export class ConfirmResetPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  confirmationCode: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class SetPasswordDto {
  @IsString()
  @MinLength(8)
  password: string;
}

export class SetTemporaryPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  temporaryPassword: string;
}

export class SetNewPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class AuthResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    role_id: number;
    mobile?: string;
    profile_image_key?: string;
    tos_accepted_at?: Date;
    is_using_temporary_password?: boolean;
  };
  organization?: {
    id: string;
    logo_image_key?: string;
    organization_name: string;
    license_type?: string;
    is_onboarding_complete: boolean;
    created_at: Date;
    created_by?: {
      name: string;
      email: string;
    };
    license_type_id?: number;
    license_type_data?: {
      id: number;
      name: string;
      created_at: Date;
      updated_at: Date;
      licenseRule?: any;
    };
    license_start_date?: Date;
    license_end_date?: Date;
    csms?: Array<{
      id: string;
      created_at: Date;
      name: string;
      email: string;
    }>;
  };
  accessToken: string;
  isTemporaryPassword?: boolean;
  mfa_required?: boolean;
  mfa_challenge?: any;
}

export class UserResponseDto {
  user: {
    id: string;
    name: string;
    email: string;
    role_id: number;
    mobile?: string;
    profile_image_key?: string | null;
    tos_accepted_at?: Date | null;
    tenant_id?: string;
    customerId?: string;
  };
}