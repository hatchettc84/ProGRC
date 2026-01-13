import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum FeedbackStatus {
    PASSED = 'passed',
    FAILED = 'failed',
    OUT_OF_SYNC = 'out_of_sync',
    FLAGGED = 'flagged',
    CLEAR = 'clear',
}

@Entity('audit_feedback')
export class AuditFeedback {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', unique: true })
    control_id: number;

    @Column({ type: 'int' })
    app_id: number;

    @Column({ type: 'varchar', default: null })
    feedback_status: FeedbackStatus;

    @Column({ type: 'text', nullable: true })
    feedback_notes: string;

    @Column({ type: 'varchar' })
    auditor_id: string;

    @Column({ type: 'varchar' })
    customer_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn({ nullable: true })
    updated_at: Date;

    @Column({ type: 'varchar', nullable: true })
    updated_by: string;

    @Column({ type: 'int' })    
    standard_id: number;

    @Column({ type: 'varchar'})
    created_by: string;

    @Column({ type: 'boolean', nullable: true })
    is_deleted: boolean;

    @Column({type: 'boolean', default: false})  
    is_updated_by_llm: boolean;
}