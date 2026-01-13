import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('control_evaluation_results')
@Unique(['app_id', 'standard_id', 'control_id', 'requirement', 'customer_id'])
export class ControlEvaluationResult {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    implementation_id: number;

    @Column({ type: 'int' })
    app_id: number;

    @Column({ type: 'int' })
    standard_id: number;

    @Column({ type: 'int' })
    control_id: number;

    @Column({ type: 'text' })
    requirement: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ type: 'text', nullable: true })
    explanation: string;

    @Column({ type: 'varchar' })
    customer_id: string;

    @Column({ type: 'varchar', enum: ['Partial', 'Pass', 'Fail'] })
    status: string;
}