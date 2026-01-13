import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user.entity';

@Entity('assessment_history')
export class AssessmentHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  customer_id: string;

  @Column({ type: 'bigint' })
  app_id: number;

  @Column({ type: 'int' })
  assessment_id: number;

  @Column({ type: 'int' })
  version: number;

  @Column({ type: 'varchar' })
  created_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_on: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column({ type: 'json' })
  outline: any;

  @Column({ name: 'outline_hash', type: 'varchar', length: 32, nullable: true })
  outline_hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'created_by' })
  created_by_user?: User;
}
