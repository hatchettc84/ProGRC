import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export enum FileType {
    PROFILE_PICTURE = 'profile_picture',
    ORG_LOGO = 'org_logo',
    SOURCE_DOCUMENTS = 'source_documents',
    ENHANCEMENT_EVIDENCE = 'enhancement_evidence',
    SUPPORT_POLICY_DOCUMENTS = 'support_policy_documents',
    SOURCE_TEXT = 'source_text',
    CRM_DOCUMENTS = 'crm_documents',
    TEMPLATE = 'template',
    ASSESSMENT = 'assessment',
}

export class FileTypeHelper {
    static getFromValue(value: string): FileType {
        return Object.values(FileType).find((v) => v === value) as FileType;
    }
}

export class GeneratePresignedUploadUrlRequest {
    
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    file_name: string;
    
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => FileTypeHelper.getFromValue(value?.trim()))
    file_type: FileType;
    
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    fe_id: string;

    @IsOptional()
    @IsNumber()
    assessment_id?: number;

    @IsOptional()
    @IsNumber()
    template_id?: number;
}

export class GeneratePresignedUploadUrlResponse {
    url: string;
    uuid: string;
    fe_id: string;
    assessment_id?: number;
}

export class GeneratePresignedUploadUrlRequestArray {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => GeneratePresignedUploadUrlRequest)
    items: GeneratePresignedUploadUrlRequest[];
}