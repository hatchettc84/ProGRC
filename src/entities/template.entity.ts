import { Standard } from "src/entities/standard_v1.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TemplateSection } from './templatesSection.entity';
import { LicenseType } from './lincenseType.entity';
import { User } from './user.entity';
import { PolicyDetails } from './policyDetails.entity';

export enum TemplateType {
    EXCEL = 'excel',
    WORD = 'word',
    CSV = 'csv',
}

export enum EntityType {
    ASSESSMENT = 'assessment',
    POLICY = 'policy'
}

@Entity('templates')
export class Templates {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255, nullable: false })
    name: string;

    @Column({
        nullable: true,
        type: 'varchar',
        length: 255
    })
    location: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    temp_location: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    type: string;

    @Column({ type: 'varchar', length: 255, nullable: true, default: EntityType.ASSESSMENT })
    entity_type: EntityType;

    @ManyToOne(() => Standard)//Assessent Framework
    @JoinColumn({
        name: 'standard_id'
    })
    standard: Standard;
    @Column({ type: 'int', nullable: true })
    standard_id: number;

    @CreateDateColumn({ name: 'upload_date', nullable: true })
    uploadDate: Date;

    @UpdateDateColumn({ name: 'update_date', nullable: true })
    updateDate: Date;

    @Column({ type: 'json' })
    outline: any;

    @OneToMany(() => TemplateSection, section => section.template)
    sections: TemplateSection[];

    customer_logo: string | null;

    @Column({ type: 'int' })
    license_type_id: number;

    @ManyToOne(() => LicenseType)
    @JoinColumn({
        name: 'license_type_id'
    })
    license_type: LicenseType;

    @Column({ type: 'boolean', default: true })
    is_published: boolean;

    @Column({ type: 'boolean', default: false })
    is_editable: boolean;

    @Column({ type: 'boolean', default: false })
    is_default: boolean;

    @Column({ type: 'int', array: true, default: '{}' })
    standard_ids: number[];

    @Column({ type: 'varchar', length: 255, array: true, default: '{}' })
    customer_ids: string[];

    @Column({ type: 'boolean', default: false })
    is_available: boolean;

    @Column({ type: 'boolean', default: false })
    llm_enabled: boolean;

    @Column({ type: 'uuid' })
    created_by: string;

    @Column({ type: 'uuid' })
    updated_by: string;

    @Column({ type: 'boolean', default: false })
    is_locked: boolean;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'created_by'
    })
    createdByUser: User;

    @ManyToOne(() => User)
    @JoinColumn({
        name: 'updated_by'
    })
    updatedByUser: User;

    @OneToOne(() => PolicyDetails, policyDetails => policyDetails.policyTemplate)
    policy: PolicyDetails;
}
