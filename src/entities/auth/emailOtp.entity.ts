import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity('email_otps')
export class EmailOtp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  code: string; // Hashed OTP code

  @Column()
  expires_at: Date;

  @Column({ default: false })
  is_used: boolean;

  @Column({ default: 0 })
  attempts: number;

  @Column({ nullable: true })
  purpose: string; // 'LOGIN', 'SETUP', 'RECOVERY'

  @CreateDateColumn()
  created_at: Date;
} 