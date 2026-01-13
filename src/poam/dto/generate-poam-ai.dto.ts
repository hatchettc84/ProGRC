import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePoamAiDto {
  @ApiProperty({ description: 'Control IDs to generate POAMs for', required: false })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  controlIds?: number[];

  @ApiProperty({ description: 'Standard ID to filter controls', required: false })
  @IsNumber()
  @IsOptional()
  standardId?: number;

  @ApiProperty({ description: 'Additional context for POAM generation', required: false })
  @IsString()
  @IsOptional()
  context?: string;
}




