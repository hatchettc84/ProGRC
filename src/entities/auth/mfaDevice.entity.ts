import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user.entity';
import { MfaDeviceType, MfaDeviceStatus } from './mfa.types';

@Entity('mfa_devices')
export class MfaDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, user => user.mfa_devices)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  type: MfaDeviceType;

  @Column({ type: 'varchar', length: 50, default: MfaDeviceStatus.PENDING })
  status: MfaDeviceStatus;

  @Column({ nullable: true })
  name: string; // User-friendly name for the device

  @Column({ nullable: true })
  secret: string; // For TOTP - encrypted

  @Column({ nullable: true })
  credential_id: string; // For PassKey

  @Column({ type: 'text', nullable: true })
  public_key: string; // For PassKey

  @Column({ nullable: true })
  counter: number; // For PassKey

  @Column({ default: false })
  is_primary: boolean;

  @Column({ nullable: true })
  last_used_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 