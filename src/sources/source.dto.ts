import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";

export class SourceFileUpdateRequest {
    
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value?.trim())
    uuid: string;

    @IsArray()
    @IsOptional()
    @Type(() => Number)
    control_ids: number[];

    @IsArray()
    @IsOptional()
    @Type(() => String)
    tags: string[];

    
}

export class SourceFileUpdateResponse {
    updated: boolean;
    uuid: string;
    constructor(updated: boolean, uuid: string) {
        this.updated = updated;
        this.uuid = uuid;
    }
}

export class SourceFileUpdateRequestArray {
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => SourceFileUpdateRequest)
    items: SourceFileUpdateRequest[];
}