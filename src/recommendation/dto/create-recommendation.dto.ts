import { ArrayNotEmpty, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BulkCreateRecommendationsDto {

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    applicationId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    controlId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    standardId: number;

    @ApiProperty({ type: [String] })
    @ArrayNotEmpty()
    @Type(() => String)
    recommendations: string[];
}