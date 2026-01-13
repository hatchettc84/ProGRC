import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateRecommendationsAiDto {
  @ApiProperty({ description: 'Control ID to generate recommendations for', required: true })
  @IsNumber()
  controlId: number;

  @ApiProperty({ description: 'Standard ID', required: true })
  @IsNumber()
  standardId: number;
}




