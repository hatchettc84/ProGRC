import { UserRoles } from "src/masterData/userRoles.entity";
import { s3Transformer } from "src/utils/entity-transformer";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { AppUser } from "./appUser.entity";
import { Customer } from './customer.entity';
import { CustomerCsm } from './customerCsm.entity';
import { PasswordHistory } from './auth/passwordHistory.entity';
import { RefreshToken } from './auth/refreshToken.entity';
import { MfaDevice } from './auth/mfaDevice.entity';
import { EmailOtp } from './auth/emailOtp.entity';
import { MfaBackupCode } from './auth/mfaBackupCode.entity';
import { MfaSetupSession } from './auth/mfaSetupSession.entity';
import { MfaDeviceType } from './auth/mfa.types';

export enum InviteStatus {
    NOT_NEEDED = 'NOT_NEEDED',//for super-admin
    NOT_SENT = 'NOT_SENT',
    SENT = 'SENT',
    RESENT = 'RESENT',
    JOINED = 'Joined',
    INVITED = 'Invited',
    RESET_PASSWORD = 'RESET_PASSWORD',
}

// MfaType enum removed - now using MfaDeviceType from auth/mfa.types.ts

@Entity('users')
export class User {
    @PrimaryColumn('uuid')
    id: string;

    @Column({ nullable: true })//for new created org admins, it can be null. Later they will update their profile
    name: string;

    @Column({ nullable: true })//for new created org admins, it can be null. Later they will update their profile
    mobile: string;

    @Column({
        nullable: true,
        transformer: s3Transformer()
    })//for new created org admins, it can be null. Later they will update their profile
    profile_image_key: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    customer_id: string;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column({ nullable: true })
    invite_status: InviteStatus;

    @ManyToOne(() => UserRoles)
    @JoinColumn({
        name: 'role_id'
    })
    role: UserRoles;

    @Column()
    role_id: number;

    @OneToMany(() => AppUser, (appUser) => appUser.user)
    appUsers: AppUser[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @Column({ nullable: true })
    deleted: boolean;

    @Column({ nullable: true })
    tos_accepted_at: Date;

    @Column({ nullable: true })
    is_profile_image_available: boolean;

    @UpdateDateColumn({ nullable: true , name: 'image_updated_at' })
    image_updated_at: Date;

    @Column({ nullable: true })
    temp_profile_image_key: string;

    @OneToMany(() => CustomerCsm, customerCsm => customerCsm.user)
    csms: CustomerCsm[];

    // New auth-related fields
    @Column({ nullable: true })
    password_hash: string;

    @Column({ default: false })
    is_locked: boolean;

    @Column({ default: false })
    mfa_enabled: boolean;

    // Legacy MFA fields removed - data migrated to mfa_devices table
    // mfa_type, totp_secret, passkey_credential_id are no longer used

    // Enhanced MFA fields
    @Column({ type: 'varchar', length: 50, nullable: true })
    primary_mfa_type: MfaDeviceType;

    @OneToMany(() => MfaDevice, device => device.user)
    mfa_devices: MfaDevice[];

    @OneToMany(() => EmailOtp, otp => otp.user)
    email_otps: EmailOtp[];

    @OneToMany(() => MfaBackupCode, code => code.user)
    backup_codes: MfaBackupCode[];

    @OneToMany(() => MfaSetupSession, session => session.user)
    mfa_setup_sessions: MfaSetupSession[];

    @Column({ nullable: true })
    last_password_change: Date;

    @Column({ default: false })
    password_reset_required: boolean;

    @OneToMany(() => PasswordHistory, history => history.user)
    password_history: PasswordHistory[];

    @OneToMany(() => RefreshToken, token => token.user)
    refresh_tokens: RefreshToken[];

    @Column({ nullable: true })
    reset_password_code: string;

    @Column({ nullable: true })
    reset_password_expires: Date;

    @Column({ default: false })
    is_using_temporary_password: boolean;
}
