import { IsString, IsEnum, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PoamStatus, PoamPriority } from 'src/entities/poam.entity';

export class CreatePoamDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  jira_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({ enum: PoamStatus, default: PoamStatus.UNASSIGNED })
  @IsEnum(PoamStatus)
  @IsOptional()
  status?: PoamStatus;

  @ApiProperty({ enum: PoamPriority, default: PoamPriority.LOW })
  @IsEnum(PoamPriority)
  @IsOptional()
  priority?: PoamPriority;

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  control_ids?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  standard_ids?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  current_assigned?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  base_recommendation_grouping?: Record<string, any>;
} 