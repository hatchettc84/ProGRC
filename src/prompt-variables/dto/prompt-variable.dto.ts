import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { TemplateSectionType } from 'src/entities/templatesSection.entity';

export class InputParameterDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    label: string;

    @IsEnum(['text', 'number', 'select', 'boolean'])
    type: 'text' | 'number' | 'select' | 'boolean';

    @IsBoolean()
    required: boolean;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    @IsString({ each: true })
    options?: string[];

    @IsOptional()
    default_value?: any;
}

export class CreatePromptVariableDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    display_name: string;

    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    prompt: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    context_source: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    output_format: string;

    @IsEnum(TemplateSectionType)
    type: TemplateSectionType;

    @IsNumber()
    @IsNotEmpty()
    group_id: number;

    @IsBoolean()
    @IsOptional()
    specific_use_case?: boolean = false;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => InputParameterDto)
    input_parameters?: InputParameterDto[];
}

export class UpdatePromptVariableDto extends PartialType(CreatePromptVariableDto) {}

export class TestPromptVariableDto {
    @IsOptional()
    customer_id?: string;

    @IsOptional()
    application_id?: number;

    @IsOptional()
    standard_id?: number;

    @IsOptional()
    assessment_id?: number;

    @IsOptional()
    policy_id?: number;

    @IsOptional()
    user_id?: string;

    @IsOptional()
    input_parameters?: Record<string, any>;
}

export class DuplicatePromptVariableDto {
    @IsString()
    @IsOptional()
    @MaxLength(100)
    display_name?: string;
} 