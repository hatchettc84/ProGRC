import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Templates } from './template.entity';

export enum PolicyStatus {
    PUBLISHED = 'published',
    DRAFT = 'draft'
}


@Entity('policy_details')
export class PolicyDetails {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('jsonb', { nullable: true })
    standards: Record<string, any>;

    @Column({ name: 'policy_name' })
    policyName: string;

    @Column({ nullable: true })
    version: string;

    @Column({ nullable: true })
    description: string;

    @Column('jsonb')
    content: Record<string, any>;

    @Column({ name: 'customer_id' })
    customerId: string;

    @Column({ name: 'customer_name' })
    customerName: string;

    @Column({ nullable: true })
    sector: string;

    @Column({ nullable: true })
    remarks: string;

    @Column({ type: 'text', array: true, nullable: true })
    references3urls: string[];

    @Column({ type: 'integer', array: true, nullable: true })
    appIds: number[];

    @Column({ type: 'boolean', default: false })
    is_locked: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @Column({ name: 'update_by' })
    updateBy: string;

    @Column({ name: 'template_id', nullable: true })
    templateId: number;

    @OneToOne(() => Templates)
    @JoinColumn({ name: 'template_id' })
    policyTemplate: Templates;

    @Column()
    status: string;


} 