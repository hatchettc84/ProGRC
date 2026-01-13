import { ViewEntity, ViewColumn, OneToOne, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { IApplicationControlMappingBase } from './iApplicationControlMappingBase.enity';
import { Control } from './control.entity';
import { ApplicationControlEvidence } from './applicationControlEvidence.entity';
import { Standard } from '../standard_v1.entity';
import { ApplicationControlMappingStatus } from './applicationControlMapping.entity';

@ViewEntity({ name: 'application_control_mapping_view' })
export class ApplicationControlMappingView implements IApplicationControlMappingBase {
    @ViewColumn()
    id: number;

    @ViewColumn()
    control_id: number;

    @ViewColumn()
    created_at: Date;

    @ViewColumn()
    updated_at: Date;

    @ViewColumn()
    app_id: number;

    @ViewColumn()
    standard_id: number;

    @ViewColumn()
    risk_level: string;

    @ViewColumn()
    is_excluded: boolean;

    @ViewColumn()
    exception_reason: string;

    @ViewColumn()
    implementation_status: ApplicationControlMappingStatus;

    @ViewColumn()
    implementation_explanation: any;

    @ViewColumn()
    is_reviewed: boolean;

    @ViewColumn()
    additional_param_updated_at: Date;

    // Extra fields from the view:
    @ViewColumn()
    is_user_modified_status: number;

    @ViewColumn()
    is_user_modified_explanation: number;

    @ViewColumn()
    num: number;

    @ViewColumn()
    deno: number;

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


    isException(): boolean {
        return this.implementation_status === ApplicationControlMappingStatus.EXCEPTION;
    }

    getPercentageStatus(): number {
        let percentage_completion = this.num && this.deno ? Number(this.num) / Number(this.deno) : null;
        return ApplicationControlMappingView.getPercentageCompletion(this.implementation_status, percentage_completion) ?? 0;
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
