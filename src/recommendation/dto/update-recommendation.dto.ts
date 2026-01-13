import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecommendationStatus, RecommendationAction } from 'src/entities/recommendation/applicationControlRecommendation.entity';

export class UpdateRecommendationDto {
    @ApiProperty({ enum: RecommendationStatus })
    @IsEnum(RecommendationStatus)
    status: RecommendationStatus;

    @ApiProperty({ enum: RecommendationAction, required: false })
    @IsEnum(RecommendationAction)
    @IsOptional()
    action?: RecommendationAction;
}
