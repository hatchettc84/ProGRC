import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreatePolicyDto {
    @ApiProperty({ example: 'Security Policy' })
    @IsString()
    @IsNotEmpty()
    policyName: string;

    @ApiProperty({ example: 'Security Policy' })
    @IsString()
    @IsOptional()
    remarks: string;

    @ApiProperty({ example: ['https://s3-url-1', 'https://s3-url-2'] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    s3Urls: string[];

    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    appIds: number[];

    @ApiProperty({ example: '1.0.0' })
    @IsString()
    @IsOptional()
    version: string;

    @ApiProperty({ example: 'technology' })
    @IsString()
    @IsOptional()
    sector: string;

    @ApiProperty({ example: 'This is our security policy' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: { sections: [] } })
    @IsOptional()
    content: Record<string, any>;

    @ApiProperty({ example: [1, 2, 3] })
    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    standards?: number[];

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsOptional()
    templateId?: number;
} 