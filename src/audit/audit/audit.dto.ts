import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { FeedbackStatus } from 'src/entities/auditFeedback.entity';

export class CreateAuditFeedbackDto {
    @IsInt()
    @IsNotEmpty()
    control_id: number;

    @IsString()
    customer_id: string;

    @IsInt()
    @IsNotEmpty()
    app_id: number;

    @IsEnum(FeedbackStatus)
    @IsOptional()
    feedback_status?: FeedbackStatus;

    @IsString()
    @IsOptional()
    feedback_notes?: string;

    @IsString()
    @IsOptional()
    auditor_id?: string;

    @IsInt()
    @IsNotEmpty()
    standard_id: number;

    @IsString()
    @IsOptional()
    created_by?: string;
}

export class UpdateAuditFeedbackDto {
    @IsEnum(FeedbackStatus)
    @IsOptional()
    feedback_status?: FeedbackStatus;

    @IsString()
    @IsOptional()
    customer_id: string;

    @IsInt()
    app_id: number;
    
    @IsInt()
    @IsOptional()
    control_id: number;

    @IsString()
    @IsOptional()
    feedback_notes?: string;

    @IsString()
    @IsOptional()
    auditor_id?: string;

    @IsString()
    @IsOptional()
    updated_by?: string;

    @IsInt()
    @IsNotEmpty()
    standard_id: number;

    @IsBoolean()
    @IsOptional()
    is_updated_by_llm?: boolean;

}