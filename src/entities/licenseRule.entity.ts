import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { LicenseType } from "./lincenseType.entity";

@Entity({ name: 'license_rules' })
export class LicenseRule {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => LicenseType)
    @JoinColumn({ name: "license_type_id" })
    licenseType: LicenseType;

    @Column({ type: "integer", nullable: false, unique: true })
    license_type_id: number;

    @Column({ type: "varchar", nullable: false })
    name: string;

    @Column({ type: "integer", nullable: true })
    number_of_applications: number;

    @Column({ type: "integer", nullable: true })
    number_of_assessments: number;

    @Column({ type: "integer", nullable: true })
    standards_per_application: number;

    @Column({ type: "jsonb", nullable: false, default: () => "'[]'" })
    available_standards: number[];

    @Column({ type: "jsonb", nullable: false, default: () => "'[]'" })
    available_templates: number[];

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}