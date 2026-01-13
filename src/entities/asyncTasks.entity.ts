import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TaskOps {
  CREATE_ASSETS = 'CREATE_ASSETS',
  CREATE_ASSESSMENTS = 'CREATE_ASSESSMENTS',
  UPDATE_ASSETS = 'UPDATE_ASSETS',
  UPDATE_ASSESSMENTS = 'UPDATE_ASSESSMENTS',
  UPDATE_COMPLIANCE = 'UPDATE_COMPLIANCE',
  EXPORT_TRUST_CENTER = 'EXPORT_TRUST_CENTER',
  CREATE_SOURCE = 'CREATE_SOURCE',
  UPDATE_SOURCE = 'UPDATE_SOURCE',
  CONTROL_EVALUATION = 'CONTROL_EVALUATION',
  GENERATE_POAM = 'GENERATE_POAM',
  SYNC_JIRA = 'SYNC_JIRA',
  CREATE_POLICY = 'CREATE_POLICY',
  UPDATE_POLICY = 'UPDATE_POLICY',
  PROCESS_CRM = 'PROCESS_CRM',
  CLONE_APPLICATION = 'CLONE_APPLICATION'
}

export enum TaskStatus {
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
  IN_PROCESS = "IN_PROCESS",
  CANCELLED = "CANCELLED"
}

@Entity('async_tasks')
export class AsyncTask {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  customer_id: string;

  @Column({ type: 'bigint' })
  app_id: number;

  @Column({
    type: 'varchar',
  })
  ops: string;

  @Column({
    type: 'varchar',
  })
  status: string;

  @Column({ type: 'json' })
  request_payload: any;

  @Column({ type: 'uuid' })
  created_by: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'varchar' })
  entity_type: string;

  @Column({ type: 'varchar' })
  entity_id: string;

  static pendingTaskStatus(): string[] {
    return [TaskStatus.PENDING, TaskStatus.IN_PROCESS];
  }

  static processedTaskStatus(): string[] {
    return [TaskStatus.PROCESSED];
  }
  
  static finalTaskStatus(): string[] {
    return [TaskStatus.PROCESSED, TaskStatus.FAILED, TaskStatus.CANCELLED];
  }
}
