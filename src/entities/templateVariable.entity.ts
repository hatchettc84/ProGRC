import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TemplateSectionType } from "./templatesSection.entity";

@Entity('template_variables')
export class TemplateVariable {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    label: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    placeholder: string;

    @Column({ type: 'enum', enum: TemplateSectionType, default: TemplateSectionType.GLOBAL }) // ENUM for type
    type: TemplateSectionType;

    @Column({ type: 'int', nullable: true })
    group_id: number;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;


}