import { IsString, IsOptional, IsEnum, IsObject, IsNumber, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewType, ReviewStatus } from 'src/entities/vendorReview.entity';

export class CreateVendorReviewDto {
  @ApiProperty({ description: 'Review type', enum: ReviewType })
  @IsEnum(ReviewType)
  reviewType: ReviewType;

  @ApiPropertyOptional({ description: 'Review title' })
  @IsString()
  @IsOptional()
  reviewTitle?: string;

  @ApiPropertyOptional({ description: 'Review notes' })
  @IsString()
  @IsOptional()
  reviewNotes?: string;

  @ApiPropertyOptional({ description: 'Assessment results', type: Object })
  @IsObject()
  @IsOptional()
  assessmentResults?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Compliance checklist', type: Object })
  @IsObject()
  @IsOptional()
  complianceChecklist?: Record<string, boolean>;

  @ApiPropertyOptional({ description: 'Risk score (0-100)', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  riskScore?: number;

  @ApiPropertyOptional({ description: 'Overall rating (1-5)', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  overallRating?: number;

  @ApiPropertyOptional({ description: 'Review date', type: String, format: 'date-time' })
  @IsDateString()
  @IsOptional()
  reviewDate?: string;

  @ApiPropertyOptional({ description: 'Next review date', type: String, format: 'date-time' })
  @IsDateString()
  @IsOptional()
  nextReviewDate?: string;

  @ApiPropertyOptional({ description: 'Review status', enum: ReviewStatus, default: ReviewStatus.PENDING })
  @IsEnum(ReviewStatus)
  @IsOptional()
  status?: ReviewStatus;
}

