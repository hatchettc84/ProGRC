import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user.entity';
import { MfaDeviceType, MfaSetupStatus } from './mfa.types';

@Entity('mfa_setup_sessions')
export class MfaSetupSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  device_type: MfaDeviceType;

  @Column({ type: 'varchar', length: 50, default: MfaSetupStatus.NOT_STARTED })
  status: MfaSetupStatus;

  @Column({ type: 'json', nullable: true })
  setup_data: any; // Store temporary setup data (encrypted)

  @Column({ nullable: true })
  device_name: string;

  @Column()
  expires_at: Date;

  @Column({ default: 0 })
  attempts: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 