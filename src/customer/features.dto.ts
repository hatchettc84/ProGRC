import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateFeatureRequest {
    @ApiProperty({ example: 'customer_id' })
    @IsString()
    @IsNotEmpty()
    customer_id: string;

    @ApiProperty({ example: 'feature_key' })
    @IsString()
    @IsNotEmpty()
    key: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    flag: boolean;
}

export class FeatureResponse {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'customer_id' })
    customer_id: string;

    @ApiProperty({ example: 'feature_key' })
    key: string;

    @ApiProperty({ example: true })
    flag: boolean;
} 