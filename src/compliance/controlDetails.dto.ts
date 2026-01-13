import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { ApplicationControlMappingStatus } from "src/entities/compliance/applicationControlMapping.entity";

export class ControlDetails {
    id: string;
    name: string;
    risk_level: string;
    enhancement_total: number;
    percentage_implemented: number;
}

export class AppStandardControlDetailsCategory {
    private categories: { [key: string]: ControlDetails[] } = {};
    private percentage_completion: { [key: string]: number } = {};
    private totalEnhancement: { [key: string]: number } = {};

    add(key: string, controlDetails: ControlDetails): void {
        if (!this.categories[key]) {
            this.categories[key] = [];
            this.percentage_completion[key] = 0;
            this.totalEnhancement[key] = 0;
        }
        this.categories[key].push(controlDetails);
        this.percentage_completion[key] += controlDetails.percentage_implemented;
        this.totalEnhancement[key] += controlDetails.enhancement_total;
    }

    getCategories(): Array<{ category_name: string; controls: ControlDetails[] }> {
        return Object.entries(this.categories).map(([key, value]) => ({
            category_name: key,
            percentage_completion: +(this.percentage_completion[key] / value.length).toFixed(2),
            total_enhancement: this.totalEnhancement[key],
            controls: value
        }));
    }
}

export class SetEvidenceEnhancementRequest {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    filePath: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    description: string;
}

export class SetEvidenceEnhancementRequestV2 {

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    filePath: string;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    description: string;

    @IsNotEmpty()
    @IsEnum(ApplicationControlMappingStatus, { message: 'status must be a valid enum value' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    status: ApplicationControlMappingStatus;
}

export class SetExceptionEnhancementRequest {
    @ArrayNotEmpty()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? parseFloat(v) : v) : value)
    @IsNumber({}, { each: true })
    ids: number[];

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    exceptionReason: string;
}

export class RemoveExceptionEnhancementRequest {
    @ArrayNotEmpty()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? parseFloat(v) : v) : value)
    @IsNumber({}, { each: true })
    ids: number[];
}

class FileInfoRequest {
    file_type?: string;

    @IsNotEmpty()
    @IsString()
    file_name: string;
}

// because we using form-data, we cannot convert automaticallty to camel case
export class UploadEnhancementEvidenceRequest {
    @ArrayNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FileInfoRequest)
    @Transform(({ value }) => {
        try {
            const parsedValue = JSON.parse(value);
            if (!Array.isArray(parsedValue)) {
                throw new Error("files_info must be a valid JSON array");
            }

            return parsedValue.map(item => {
                const fileInfoRequest = new FileInfoRequest();
                fileInfoRequest.file_name = item.file_name;
                return fileInfoRequest;
            });
        } catch {
            throw new Error("files_info must be a valid JSON array");
        }
    })
    files_info: FileInfoRequest[];
}

export class UploadEnhancementEvidenceResponse {
    key: string;
    file_type: string;
    file_name: string;
}

export class WebhookTypeRequest {
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsArray()
    data: WebhookRequest[] | any;
}

export class WebhookRequest {
    id: string;
    app_id: string;
    control_enhancement_id: string;
    control_parent_id: string;
    user_explanation: string;

    implementation_explanation: string;
    implementation_explanationEmbedding: string;
    created_at: string;
    updated_at: string;
    source_id: string;
    asset_ids: string[];
    customer_id: number;
}

export class RiskLevelRequest {
    @ArrayNotEmpty()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? parseFloat(v) : v) : value)
    @IsNumber({}, { each: true })
    ids: number[];

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
    riskLevels: string;
}

export class ReviewedRequest {
    @ArrayNotEmpty()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? parseFloat(v) : v) : value)
    @IsNumber({}, { each: true })
    ids: number[];

    @IsNotEmpty()
    @IsBoolean()
    isReviewed: boolean;
}

export class SetExplationEnhancementRequest {
    @ArrayNotEmpty()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? parseFloat(v) : v) : value)
    @IsNumber({}, { each: true })
    ids: number[];

    @IsOptional()
    @IsEnum(ApplicationControlMappingStatus, { message: 'status must be a valid enum value' })
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    implementationStatus: ApplicationControlMappingStatus;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    implementationExplanation: any;
}

export class SetEvidenceRequestV2 {

    @ArrayNotEmpty()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? parseFloat(v) : v) : value)
    @IsNumber({}, { each: true })
    ids: number[];

    @IsNotEmpty()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? v.trim() : v) : [])
    @IsString({ each: true })
    filePath: string[];

    @IsOptional()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    description: string;
}

export class EvidenceFileUpdateRequest {
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    uuid: string;

    @IsOptional()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    description: string;

    @ArrayNotEmpty()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? parseInt(v) : v) : value)
    @IsNumber({}, { each: true })
    control_ids: number[];
    
    @IsArray()
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? parseInt(v) : v) : value)
    @IsNumber({}, { each: true })
    standard_ids: number[];
}


export class EvidenceFileUpdateRequestArray {
    @ArrayNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EvidenceFileUpdateRequest)
    items: EvidenceFileUpdateRequest[];
}

export class EvidenceFileUpdateResponse {
    update: boolean;
    uuid: string;
}

export class SetAdditionalParamReq {
    @ArrayNotEmpty()
    @IsArray()
    @Transform(({ value }) => Array.isArray(value) ? value.map(v => typeof v === 'string' ? parseFloat(v) : v) : value)
    @IsNumber({}, { each: true })
    ids: number[];

    @IsOptional()
    @IsString()
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    params: string;
}
