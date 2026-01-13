import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class UpdatePolicyDetailsDto {
  @ApiProperty({ description: 'Policy name', required: false })
  @IsString()
  @IsOptional()
  policyName?: string;

  @ApiProperty({ description: 'Policy description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Policy sector', required: false })
  @IsString()
  @IsOptional()
  sector?: string;

  @ApiProperty({ description: 'Policy remarks', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiProperty({ description: 'Policy standards', required: false, type: [String] })
  @IsArray()
  @IsOptional()
  standards?: string[];

  @ApiProperty({ description: 'Policy template ID', required: false })
  @IsNumber()
  @IsOptional()
  templateId?: number;
} 