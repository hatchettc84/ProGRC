import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class AssetDto {

    @IsUUID()
    source_type_id: string;

    @IsUUID()
    source_version: string;

    @IsString()
    asset_id: string;

    @IsString()
    asset_name: string;

    @IsString()
    asset_summary: string;

    @IsArray()
    @IsOptional()
    embeddings_small?: number[]; // Represented as an array of numbers to handle vector data

    @IsArray()
    @IsOptional()
    embeddings_large?: number[]; // Represented as an array of numbers to handle vector data

    // @IsDate()
    // created_at: Date;

    // @IsDate()
    // updated_at: Date;

    @IsUUID()
    source_id: string;

    @IsString()
    customer_id: string;

    @IsBoolean()
    is_active: boolean;

    @IsUUID()
    @IsOptional()
    app_id?: string;
}
