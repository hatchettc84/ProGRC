import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ApplicationControlEvidence } from "./applicationControlEvidence.entity";
import { Control } from "./control.entity";
import { Standard } from "../standard_v1.entity";
import { IApplicationControlMappingBase } from "./iApplicationControlMappingBase.enity";

export enum ApplicationControlMappingStatus {
    NOT_IMPLEMENTED = 'not_implemented',
    IMPLEMENTED = 'implemented',
    PARTIALLY_IMPLEMENTED = 'partially_implemented',
    NOT_APPLICABLE = 'not_applicable',
    PLANNED = 'planned',
    ALTERNATIVE_IMPLEMENTATION = 'alternative_implementation',
    EXCEPTION = 'exception',
    NA = 'N/A'
}

@Entity('application_control_mapping')
export class ApplicationControlMapping implements IApplicationControlMappingBase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    standard_id: number;

    @Column()
    app_id: number;

    @Column()
    control_id: number;

    @Column('enum', { enum: ApplicationControlMappingStatus })
    implementation_status: ApplicationControlMappingStatus;

    @Column({ type: 'json' })
    implementation_explanation: any;

    @Column('enum', { enum: ApplicationControlMappingStatus })
    user_implementation_status: ApplicationControlMappingStatus;

    @Column({ type: 'json' })
    user_implementation_explanation: any;

    @Column()
    risk_level: string;

    @Column()
    exception_reason: string;

    @Column()
    is_reviewed: boolean;

    @Column()
    is_excluded: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ nullable: true, type: 'timestamp without time zone' })
    additional_param_updated_at: Date;

    @OneToOne(() => Control, (control) => control.application_control_mapping)
    control: Control;

    @OneToMany(() => ApplicationControlEvidence, evidence => evidence.application_control_mapping)
    @JoinColumn({ name: 'id', referencedColumnName: 'application_control_mapping_id' })
    evidences: ApplicationControlEvidence[];

    @ManyToOne(() => Standard)
    @JoinColumn({ name: 'standard_id', referencedColumnName: 'id' })
    standard: Standard;


    source_total: number = 0;

    is_synced: boolean = true;

    @Column()
    user_additional_parameter: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    percentage_completion: number | null;

    getPercentageStatus(): number {
        return ApplicationControlMapping.getPercentageCompletion((this.user_implementation_status || this.implementation_status), this.percentage_completion) ?? 0;
    }

    isException(): boolean {
        return this.user_implementation_status === ApplicationControlMappingStatus.EXCEPTION || this.implementation_status === ApplicationControlMappingStatus.EXCEPTION;
    }



    static getPercentageCompletion(status: ApplicationControlMappingStatus, percentage_completion: number): number | null {
        switch (status) {
            case ApplicationControlMappingStatus.NOT_IMPLEMENTED:
            case ApplicationControlMappingStatus.PLANNED:
            case ApplicationControlMappingStatus.NOT_APPLICABLE:
            case ApplicationControlMappingStatus.EXCEPTION:
            case ApplicationControlMappingStatus.NA:
                return 0;
            case ApplicationControlMappingStatus.IMPLEMENTED:
            case ApplicationControlMappingStatus.ALTERNATIVE_IMPLEMENTATION:
                return 100;
            case ApplicationControlMappingStatus.PARTIALLY_IMPLEMENTED:
                return Number(percentage_completion) || 50;
            default:
                return 0;
        }
    }
}
