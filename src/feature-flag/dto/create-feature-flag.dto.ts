import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeatureFlagDto {
  @ApiProperty({ description: 'Name of the feature flag' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of what the feature flag controls', required: false, default: '' })
  @IsString()
  @IsOptional()
  description?: string = '';

  @ApiProperty({ description: 'Whether the feature flag is enabled', default: false })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiProperty({ description: 'Whether the feature is enabled globally', default: false })
  @IsBoolean()
  @IsOptional()
  isGloballyEnabled?: boolean;

  @ApiProperty({ description: 'List of entities allowed to use this feature', type: [String], default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  whitelist?: string[];

  @ApiProperty({ description: 'List of entities blocked from using this feature', type: [String], default: [] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  blacklist?: string[];
}
