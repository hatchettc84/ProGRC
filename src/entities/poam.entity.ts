import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum PoamStatus {
  UNASSIGNED = 'Unassigned',
  PENDING = 'Pending',
  IN_PROGRESS = 'In-Progress',
  UNDER_REVIEW = 'Under-Review',
  VALIDATED = 'Validated',
  INVALID = 'Invalid'
}

export enum PoamPriority {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low'
}

@Entity('poam_table')
export class Poam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  jira_id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PoamStatus,
    default: PoamStatus.UNASSIGNED
  })
  status: PoamStatus;

  @Column({
    type: 'enum',
    enum: PoamPriority,
    default: PoamPriority.LOW
  })
  priority: PoamPriority;

  @Column({type: 'jsonb', default: '[]::jsonb', nullable: true})
  control_ids: Record<string, any>;

  @Column({type: 'jsonb', default: '[]::jsonb', nullable: true})
  standard_ids: Record<string, any>;

  @Column()
  application_id: number;

  @Column({ nullable: true })
  current_assigned: string;

  @Column({type: 'jsonb', default: '[]::jsonb', nullable: true})
  base_recommendation_grouping: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  created_by: string;

  @Column()
  updated_by: string;
}
