import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Customer } from "./customer.entity";

@Entity('template_variable_group')
export class TemplateVariableGroup {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({ type: 'int', nullable: true })
    parent_id: number;

    @Column({ type: 'int', nullable: true })
    order_index: number;

    @Column({ nullable: true })
    customer_id: string;

    @Column({ type: 'boolean', default: false })
    is_custom: boolean;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;

    // Relationships
    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;
    
}