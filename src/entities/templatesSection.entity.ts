import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Templates } from './template.entity';

export enum TemplateSectionType {
    GLOBAL = 'GLOBAL',
    CONTROL_FAMILY = 'CONTROL_FAMILY',
    CONTROL = 'CONTROL'
}

@Entity('templates_section')
@Unique(['template_id', 'section_id']) // Defining unique constraint
export class TemplateSection {
    @PrimaryGeneratedColumn() // SERIAL PRIMARY KEY
    id: number;

    @Column({ type: 'int', nullable: false }) // INT NOT NULL
    template_id: number;

    @Column({ type: 'varchar', length: 200, nullable: false }) // VARCHAR(200) NOT NULL
    title: string;

    @Column({ type: 'int', nullable: true }) // INT for level
    level: number;

    @Column({ type: 'uuid', nullable: false }) // VARCHAR(36) NOT NULL
    section_id: string;

    @Column({ type: 'varchar', length: 200, nullable: true }) // VARCHAR(200) for outline_search_key
    outline_search_key: string;

    @Column({ type: 'text', nullable: true }) // TEXT for html_content
    html_content: string;

    @Column({ type: 'text', nullable: true }) // TEXT for description
    description: string;

    @Column({ type: 'varchar', length: 250, nullable: true }) // VARCHAR(250) for s3_path
    s3_path: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    created_at: Date;

    @Column({ type: 'boolean', default: true }) // BOOLEAN DEFAULT true for is_active
    is_active: boolean;

    @ManyToOne(() => Templates, template => template.sections)
    @JoinColumn({ name: 'template_id' })
    template: Templates;

    @Column({ type: 'enum', enum: TemplateSectionType, default: TemplateSectionType.GLOBAL }) // ENUM for type
    type: TemplateSectionType;

    @Column({ type: 'int', nullable: true }) // INT for parent_id
    parent_id: number;

    @Column({ type: 'boolean', default: false }) // BOOLEAN DEFAULT false for is_looped
    is_looped: boolean;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // TIMESTAMP DEFAULT CURRENT_TIMESTAMP for updated_at
    updated_at: Date;

    @Column({ type: 'uuid' }) // VARCHAR(255) for created_by
    created_by: string;

    @Column({ type: 'uuid' }) // VARCHAR(255) for updated_by
    updated_by: string;

    @OneToMany(() => TemplateSection, templateSection => templateSection.parentSection)
    children: TemplateSection[];

    @ManyToOne(() => TemplateSection, templateSection => templateSection.children)
    @JoinColumn({ name: 'parent_id' })
    parentSection: TemplateSection;


}