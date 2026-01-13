// MFA Device Types
export enum MfaDeviceType {
  TOTP = 'TOTP',
  PASSKEY = 'PASSKEY',
  EMAIL = 'EMAIL'
}

// MFA Device Status
export enum MfaDeviceStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED'
}

// MFA Setup Status
export enum MfaSetupStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

// Security Policy Types
export enum PolicyType {
  MFA_ENFORCEMENT = 'MFA_ENFORCEMENT',
  PASSWORD_POLICY = 'PASSWORD_POLICY',
  SESSION_POLICY = 'SESSION_POLICY',
  ACCESS_CONTROL = 'ACCESS_CONTROL'
}

export enum PolicyScope {
  GLOBAL = 'GLOBAL',
  ORGANIZATION = 'ORGANIZATION',
  ROLE = 'ROLE',
  USER = 'USER'
}

export enum PolicyAction {
  ENFORCE = 'ENFORCE',
  RECOMMEND = 'RECOMMEND',
  DISABLE = 'DISABLE'
}

export enum MfaEnforcementLevel {
  DISABLED = 'DISABLED',
  OPTIONAL = 'OPTIONAL',
  RECOMMENDED = 'RECOMMENDED',
  REQUIRED = 'REQUIRED'
}

// MFA Enforcement Rules Interface
export interface MfaEnforcementRules {
  required: boolean;
  allowed_types: MfaDeviceType[];
  min_devices: number;
  max_devices: number;
  grace_period_days: number;
  bypass_roles: string[];
  enforcement_date?: Date;
} 