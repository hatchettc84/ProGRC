import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user.entity';
import { PolicyType, PolicyScope, PolicyAction } from './mfa.types';

@Entity('security_policies')
export class SecurityPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: PolicyType;

  @Column({ type: 'varchar', length: 50 })
  scope: PolicyScope;

  @Column({ nullable: true })
  scope_id: string; // org_id, role_id, or user_id

  @Column({ type: 'json' })
  rules: any; // Policy-specific rules

  @Column({ type: 'varchar', length: 50, default: PolicyAction.RECOMMEND })
  action: PolicyAction;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  priority: number; // Higher priority overrides lower

  @Column()
  created_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 