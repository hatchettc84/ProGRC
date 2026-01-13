// create entity CrmData
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { AppStandard } from '../appStandard.entity';

@Entity('crm_data')
export class CrmData {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    app_id: number;

    @Column({ type: 'int' })
    standard_id: number;

    @Column({ type: 'varchar', length: 255 })
    customer_id: string;

    @Column({ type: 'int' })
    control_id: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    crm_provider: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    crm_status: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    crm_parameters: string;

    @Column({ type: 'text', nullable: true })
    crm_explanation: string;

    @Column({ type: 'text', nullable: true })
    partner_instructions: string;

    @Column({ type: 'text', nullable: true })
    end_customer_instructions: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;
}

