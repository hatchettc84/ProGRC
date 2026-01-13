export interface IApplicationControlMappingBase {
    id: number;
    control_id: number;
    created_at: Date;
    updated_at: Date;
    app_id: number;
    standard_id: number;
    risk_level: string;
    is_excluded: boolean;
    exception_reason: string;
    implementation_status: string;
    is_reviewed: boolean;
    additional_param_updated_at: Date;
}
