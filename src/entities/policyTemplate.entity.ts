import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { PolicyDetails } from './policyDetails.entity';

@Entity('policy_template')
export class PolicyTemplate {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column('jsonb')
    content: Record<string, any>;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'created_by', nullable: true })
    createdBy: string;

    @OneToOne(() => PolicyDetails, policyDetails => policyDetails.policyTemplate)
    policy: PolicyDetails;
} 