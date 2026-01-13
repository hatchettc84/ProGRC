import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TemplateSectionType } from "./templatesSection.entity";
import { TemplateVariableGroup } from "./templateVariableGroup.entity";
import { Customer } from "./customer.entity";

export interface InputParameter {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean';
    required: boolean;
    description?: string;
    options?: string[];
    default_value?: any;
}

@Entity('prompt_template_variables')
export class PromptTemplateVariable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
    variable_name: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    display_name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'text', nullable: false })
    prompt: string;

    @Column({ type: 'varchar', length: 500, nullable: false })
    context_source: string;

    @Column({ type: 'text', nullable: false })
    output_format: string;

    @Column({ type: 'enum', enum: TemplateSectionType, default: TemplateSectionType.GLOBAL })
    type: TemplateSectionType;

    @Column({ type: 'int', nullable: false })
    group_id: number;

    @Column({ type: 'boolean', default: false })
    specific_use_case: boolean;

    @Column({ type: 'json', nullable: true })
    input_parameters: InputParameter[];

    @Column({ type: 'varchar', nullable: true })
    customer_id: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'varchar', nullable: false })
    created_by: string;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    created_at: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updated_at: Date;

    // Relationships
    @ManyToOne(() => TemplateVariableGroup)
    @JoinColumn({ name: 'group_id' })
    group: TemplateVariableGroup;

    @ManyToOne(() => Customer)
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;
} 