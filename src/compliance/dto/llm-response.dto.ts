import { IsString, IsNotEmpty, IsArray, IsNumber, Min, Max, IsEnum, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Implementation status enum
 */
export enum ImplementationStatus {
  NOT_IMPLEMENTED = 'not_implemented',
  PARTIALLY_IMPLEMENTED = 'partially_implemented',
  IMPLEMENTED = 'implemented',
  NOT_APPLICABLE = 'not_applicable',
  PLANNED = 'planned',
}

/**
 * Evidence priority enum
 */
export enum EvidencePriority {
  REQUIRED = 'required',
  RECOMMENDED = 'recommended',
  OPTIONAL = 'optional',
}

/**
 * Evidence type enum
 */
export enum EvidenceType {
  DOCUMENT = 'document',
  SCREENSHOT = 'screenshot',
  CONFIGURATION = 'configuration',
  POLICY = 'policy',
  LOG = 'log',
  CODE = 'code',
}

/**
 * Recommendation priority enum
 */
export enum RecommendationPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Coverage Analysis DTO
 */
export class CoverageAnalysisDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  implemented_requirements: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  missing_requirements: string[];
}

/**
 * Recommendation DTO
 */
export class RecommendationDto {
  @IsEnum(RecommendationPriority)
  @IsNotEmpty()
  priority: RecommendationPriority;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  rationale: string;
}

/**
 * Implementation Statement DTO
 */
export class ImplementationStatementDto {
  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsNotEmpty()
  current_state: string;

  @IsArray()
  @IsString({ each: true })
  evidence_found: string[];

  @ValidateNested()
  @Type(() => CoverageAnalysisDto)
  coverage_analysis: CoverageAnalysisDto;

  @IsArray()
  @IsString({ each: true })
  gaps: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendationDto)
  recommendations: RecommendationDto[];
}

/**
 * Evidence Suggestion DTO
 */
export class EvidenceSuggestionDto {
  @IsEnum(EvidenceType)
  @IsNotEmpty()
  type: EvidenceType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(EvidencePriority)
  @IsNotEmpty()
  priority: EvidencePriority;

  @IsString()
  @IsOptional()
  example?: string;
}

/**
 * Complete LLM Response DTO for Compliance Analysis
 */
export class LLMComplianceResponseDto {
  @IsEnum(ImplementationStatus)
  @IsNotEmpty()
  implementation_status: ImplementationStatus;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage_completion: number;

  @ValidateNested()
  @Type(() => ImplementationStatementDto)
  implementation_statement: ImplementationStatementDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceSuggestionDto)
  @IsOptional()
  evidence_suggestions?: EvidenceSuggestionDto[];

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  confidence_score?: number;
}

/**
 * Batch LLM Response DTO (for processing multiple controls at once)
 */
export class BatchLLMResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ControlAnalysisDto)
  controls: ControlAnalysisDto[];
}

/**
 * Individual Control Analysis within Batch
 */
export class ControlAnalysisDto {
  @IsString()
  @IsNotEmpty()
  control_id: string;

  @IsEnum(ImplementationStatus)
  @IsNotEmpty()
  implementation_status: ImplementationStatus;

  @IsNumber()
  @Min(0)
  @Max(100)
  percentage_completion: number;

  @IsString()
  @IsNotEmpty()
  explanation: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  evidence_found?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  gaps?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecommendationDto)
  @IsOptional()
  recommendations?: RecommendationDto[];
}
