import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  correctedData?: any;
  qualityScore: number; // 0-100
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  autoCorrection?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

/**
 * LLM Output Validator Service
 *
 * Validates and auto-corrects LLM responses for compliance analysis
 * Ensures quality, consistency, and accuracy of implementation statements
 */
@Injectable()
export class LLMOutputValidatorService {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Validate complete control analysis response
   */
  async validateControlAnalysis(
    response: any,
    sourceText: string,
    controlName: string
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let correctedData = { ...response };
    let qualityScore = 100;

    // 1. Validate percentage matches implementation_status
    const percentageValidation = this.validatePercentageStatusConsistency(
      response.percentage_completion,
      response.implementation_status
    );
    if (!percentageValidation.isValid) {
      errors.push(percentageValidation.error);
      qualityScore -= 15;
      // Auto-correct percentage
      correctedData.percentage_completion = percentageValidation.correctedPercentage;
      this.logger.warn(
        `Auto-corrected percentage for ${controlName}: ${response.percentage_completion}% → ${percentageValidation.correctedPercentage}%`
      );
    }

    // 2. Validate evidence exists in source
    const evidenceValidation = await this.validateEvidenceInSource(
      response.evidence_found || [],
      sourceText,
      controlName
    );
    if (evidenceValidation.invalidCount > 0) {
      warnings.push({
        field: 'evidence_found',
        message: `${evidenceValidation.invalidCount}/${response.evidence_found?.length || 0} evidence items could not be verified in source`,
        suggestion: 'Only include evidence that exists in the source document'
      });
      qualityScore -= evidenceValidation.invalidCount * 5;
      // Auto-correct by removing hallucinated evidence
      correctedData.evidence_found = evidenceValidation.validEvidence;
    }

    // 3. Validate explanation quality
    const explanationValidation = this.validateExplanationQuality(
      response.explanation || ''
    );
    if (!explanationValidation.isValid) {
      errors.push({
        field: 'explanation',
        message: explanationValidation.message,
        severity: 'medium'
      });
      qualityScore -= 10;
    }

    // 4. Validate recommendation specificity
    const recommendationsValidation = this.validateRecommendationSpecificity(
      response.recommendations || []
    );
    if (recommendationsValidation.vagueCount > 0) {
      warnings.push({
        field: 'recommendations',
        message: `${recommendationsValidation.vagueCount}/${response.recommendations?.length || 0} recommendations are too vague`,
        suggestion: 'Provide specific, actionable recommendations with concrete tools/methods'
      });
      qualityScore -= recommendationsValidation.vagueCount * 8;
      correctedData.recommendations = recommendationsValidation.improvedRecommendations;
    }

    // 5. Validate gaps specificity
    const gapsValidation = this.validateGapsSpecificity(
      response.gaps || []
    );
    if (gapsValidation.vagueCount > 0) {
      warnings.push({
        field: 'gaps',
        message: `${gapsValidation.vagueCount}/${response.gaps?.length || 0} gaps are too generic`,
        suggestion: 'Provide specific gaps with concrete details'
      });
      qualityScore -= gapsValidation.vagueCount * 5;
      correctedData.gaps = gapsValidation.improvedGaps;
    }

    // 6. Validate minimum content requirements
    const contentValidation = this.validateMinimumContent(response);
    if (!contentValidation.isValid) {
      errors.push({
        field: 'content',
        message: contentValidation.message,
        severity: 'high'
      });
      qualityScore -= 20;
    }

    const isValid = errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0;

    return {
      isValid,
      errors,
      warnings,
      correctedData: isValid || errors.length > 0 ? correctedData : undefined,
      qualityScore: Math.max(0, qualityScore)
    };
  }

  /**
   * Validate batch control analysis responses
   */
  async validateBatchResponse(
    batchResponse: { controls: any[] },
    sourceText: string
  ): Promise<{ results: Map<string, ValidationResult>; overallQualityScore: number }> {
    const results = new Map<string, ValidationResult>();
    let totalQuality = 0;

    for (const control of batchResponse.controls) {
      const validation = await this.validateControlAnalysis(
        control,
        sourceText,
        control.control_id
      );
      results.set(control.control_id, validation);
      totalQuality += validation.qualityScore;
    }

    const overallQualityScore = batchResponse.controls.length > 0
      ? totalQuality / batchResponse.controls.length
      : 0;

    this.logger.log(
      `Batch validation completed: ${batchResponse.controls.length} controls, ` +
      `overall quality score: ${overallQualityScore.toFixed(1)}/100`
    );

    return { results, overallQualityScore };
  }

  /**
   * 1. Validate percentage matches implementation_status
   */
  private validatePercentageStatusConsistency(
    percentage: number,
    status: string
  ): { isValid: boolean; error?: ValidationError; correctedPercentage?: number } {
    const statusRanges: Record<string, { min: number; max: number; typical: number }> = {
      not_implemented: { min: 0, max: 20, typical: 0 },
      planned: { min: 10, max: 30, typical: 20 },
      partially_implemented: { min: 30, max: 70, typical: 50 },
      implemented: { min: 80, max: 100, typical: 95 },
      not_applicable: { min: 0, max: 0, typical: 0 }
    };

    const range = statusRanges[status];
    if (!range) {
      return {
        isValid: false,
        error: {
          field: 'implementation_status',
          message: `Invalid implementation status: ${status}`,
          severity: 'critical'
        }
      };
    }

    if (percentage < range.min || percentage > range.max) {
      return {
        isValid: false,
        error: {
          field: 'percentage_completion',
          message: `Percentage ${percentage}% does not match status "${status}" (expected ${range.min}-${range.max}%)`,
          severity: 'high',
          autoCorrection: range.typical
        },
        correctedPercentage: range.typical
      };
    }

    return { isValid: true };
  }

  /**
   * 2. Validate evidence exists in source
   */
  private async validateEvidenceInSource(
    evidenceItems: string[],
    sourceText: string,
    controlName: string
  ): Promise<{ invalidCount: number; validEvidence: string[] }> {
    const validEvidence: string[] = [];
    let invalidCount = 0;

    const sourceLower = sourceText.toLowerCase();

    for (const evidence of evidenceItems) {
      if (!evidence || evidence.trim().length === 0) {
        invalidCount++;
        continue;
      }

      // Extract key terms from evidence (remove common words)
      const keyTerms = this.extractKeyTerms(evidence);

      // Check if at least 50% of key terms appear in source
      const matchingTerms = keyTerms.filter(term =>
        sourceLower.includes(term.toLowerCase())
      );

      if (matchingTerms.length >= keyTerms.length * 0.5) {
        validEvidence.push(evidence);
      } else {
        invalidCount++;
        this.logger.debug(
          `Possible hallucinated evidence for ${controlName}: "${evidence.substring(0, 100)}..."`
        );
      }
    }

    return { invalidCount, validEvidence };
  }

  /**
   * Extract key terms from text (remove common words)
   */
  private extractKeyTerms(text: string): string[] {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'it', 'its', 'they', 'their', 'them', 'we', 'our', 'us', 'you', 'your'
    ]);

    return text
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 10); // Take top 10 key terms
  }

  /**
   * 3. Validate explanation quality
   */
  private validateExplanationQuality(
    explanation: string
  ): { isValid: boolean; message?: string } {
    if (!explanation || explanation.trim().length < 50) {
      return {
        isValid: false,
        message: 'Explanation is too short (minimum 50 characters)'
      };
    }

    // Check for vague phrases
    const vaguePatterns = [
      /implement.*security/i,
      /improve.*controls/i,
      /enhance.*protection/i,
      /better.*compliance/i,
      /more.*documentation/i
    ];

    const hasVagueness = vaguePatterns.some(pattern => pattern.test(explanation));
    if (hasVagueness) {
      return {
        isValid: false,
        message: 'Explanation contains vague phrases. Be more specific.'
      };
    }

    return { isValid: true };
  }

  /**
   * 4. Validate recommendation specificity
   */
  private validateRecommendationSpecificity(
    recommendations: Array<{ action: string; priority?: string; rationale?: string }>
  ): { vagueCount: number; improvedRecommendations: typeof recommendations } {
    let vagueCount = 0;
    const improvedRecommendations = recommendations.map(rec => {
      if (this.isVagueRecommendation(rec.action)) {
        vagueCount++;
        // Attempt to improve vague recommendations
        return {
          ...rec,
          action: rec.action + ' [Note: This recommendation needs more specific details about implementation]'
        };
      }
      return rec;
    });

    return { vagueCount, improvedRecommendations };
  }

  /**
   * Check if recommendation is vague
   */
  private isVagueRecommendation(action: string): boolean {
    const vagueIndicators = [
      'implement security',
      'improve controls',
      'enhance protection',
      'add measures',
      'strengthen security',
      'increase compliance',
      'better documentation',
      'more security',
      'additional controls'
    ];

    const actionLower = action.toLowerCase();
    return vagueIndicators.some(indicator => actionLower.includes(indicator)) &&
           actionLower.length < 80; // Short and vague is worse
  }

  /**
   * 5. Validate gaps specificity
   */
  private validateGapsSpecificity(
    gaps: string[]
  ): { vagueCount: number; improvedGaps: string[] } {
    let vagueCount = 0;
    const improvedGaps = gaps.map(gap => {
      if (this.isVagueGap(gap)) {
        vagueCount++;
        return gap + ' [Note: This gap needs more specific details]';
      }
      return gap;
    });

    return { vagueCount, improvedGaps };
  }

  /**
   * Check if gap is vague
   */
  private isVagueGap(gap: string): boolean {
    const vaguePatterns = [
      /lack.*documentation/i,
      /missing.*controls/i,
      /no.*evidence/i,
      /insufficient.*security/i,
      /inadequate.*protection/i
    ];

    return vaguePatterns.some(pattern => pattern.test(gap)) && gap.length < 40;
  }

  /**
   * 6. Validate minimum content requirements
   */
  private validateMinimumContent(
    response: any
  ): { isValid: boolean; message?: string } {
    // Check required fields exist
    if (!response.explanation) {
      return { isValid: false, message: 'Missing explanation field' };
    }

    if (response.percentage_completion === undefined || response.percentage_completion === null) {
      return { isValid: false, message: 'Missing percentage_completion field' };
    }

    if (!response.implementation_status) {
      return { isValid: false, message: 'Missing implementation_status field' };
    }

    // Check minimum array lengths for partially/not implemented
    if (response.implementation_status === 'not_implemented' ||
        response.implementation_status === 'partially_implemented') {
      if (!response.gaps || response.gaps.length === 0) {
        return {
          isValid: false,
          message: 'Not implemented/partially implemented controls must have gaps identified'
        };
      }

      if (!response.recommendations || response.recommendations.length === 0) {
        return {
          isValid: false,
          message: 'Not implemented/partially implemented controls must have recommendations'
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Get validation summary for logging/monitoring
   */
  getValidationSummary(result: ValidationResult): string {
    return `Quality: ${result.qualityScore}/100, ` +
           `Errors: ${result.errors.length} (${result.errors.filter(e => e.severity === 'critical' || e.severity === 'high').length} critical), ` +
           `Warnings: ${result.warnings.length}`;
  }
}
