import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsJSON, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssessmentRequest {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    title: string;

    @IsArray()
    @Transform(({ value }) => value.map(Number)) // Ensure standard_ids are parsed as numbers
    standardIds: number[];

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    appId: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    templateId: string;
}

export class UpdateAssessmentRequest {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    title: string;
}

export class createWebhookAssessmentSection {
    @IsInt()
    id: number;

    @IsString()
    customerId: string;

    @IsInt()
    appId: number;

    @IsInt()
    assessmentId: number;

    @IsString()
    sectionId: string;

    @IsString()
    title: string;

    @IsInt()
    version: number;

    @IsString()
    createdBy: string;

    @IsBoolean()
    isDeleted: boolean;

    @IsOptional()
    @IsJSON()
    content?: Record<string, any>;

    @IsOptional()
    @IsString()
    s3Path?: string;

    @IsOptional()
    @IsInt()
    copyOf?: number;
}


export class AssessmentTypeRequest {
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsArray()
    data: createWebhookAssessmentSection[] | any;
}

// assessment.dto.ts

export class UpdateAssessmentSectionDto {
    @IsOptional()
    @IsInt()
    id: number;

    @IsOptional()
    @IsString()
    customerId: string;

    @IsOptional()
    @IsInt()
    appId: number;

    @IsOptional()
    @IsInt()
    assessmentId: number;

    @IsString()
    sectionId: string;

    @IsOptional()
    @IsString()
    title: string;

    @IsOptional()
    @IsInt()
    version: number;

    @IsOptional()
    @IsString()
    createdBy: string;

    @IsJSON()
    content?: Record<string, any>;

    @IsOptional()
    @IsString()
    s3Path?: string;

    @IsOptional()
    @IsInt()
    copyOf?: number;
}


export class AssessmentUpdateTypeRequest {
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsArray()
    data: UpdateAssessmentSectionDto[] | any;
}
