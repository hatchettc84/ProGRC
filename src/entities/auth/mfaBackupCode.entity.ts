import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity('mfa_backup_codes')
export class MfaBackupCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  code_hash: string; // Hashed backup code

  @Column({ default: false })
  is_used: boolean;

  @Column({ nullable: true })
  used_at: Date;

  @CreateDateColumn()
  created_at: Date;
} 