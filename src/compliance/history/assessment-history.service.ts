import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ApplicationControlMapping } from 'src/entities/compliance/applicationControlMapping.entity';
import { LoggerService } from 'src/logger/logger.service';

/**
 * Historical assessment data
 */
export interface HistoricalAssessment {
  controlId: number;
  controlName: string;
  assessmentDate: Date;
  implementationStatus: string;
  percentageCompletion: number;
  explanation: any; // JSON explanation object
  userModified: boolean; // Was this modified by user after LLM generation?
  qualityScore?: number;
}

/**
 * Assessment change summary
 */
export interface AssessmentChangeSummary {
  controlId: number;
  controlName: string;
  statusChanged: boolean;
  previousStatus: string;
  currentStatus: string;
  percentageChange: number; // +/- percentage points
  improvementTrend: 'improving' | 'declining' | 'stable';
  daysElapsed: number;
  significantChanges: string[]; // List of significant changes detected
}

/**
 * Assessment History Service
 *
 * Tracks and analyzes historical compliance assessments
 * Provides context for LLM to understand changes over time
 */
@Injectable()
export class AssessmentHistoryService {
  constructor(
    @InjectRepository(ApplicationControlMapping)
    private readonly appControlMapRepo: Repository<ApplicationControlMapping>,
    private readonly logger: LoggerService
  ) {}

  /**
   * Get previous assessment for a control
   */
  async getPreviousAssessment(
    appId: number,
    controlId: number
  ): Promise<HistoricalAssessment | null> {
    try {
      const mapping = await this.appControlMapRepo.findOne({
        where: {
          app_id: appId,
          control_id: controlId,
        },
        relations: ['control'],
      });

      if (!mapping || !mapping.updated_at) {
        return null;
      }

      return {
        controlId: mapping.control_id,
        controlName: mapping.control?.control_name || 'Unknown',
        assessmentDate: mapping.updated_at,
        implementationStatus: mapping.implementation_status || 'not_implemented',
        percentageCompletion: mapping.percentage_completion || 0,
        explanation: this.parseExplanation(mapping.implementation_explanation),
        userModified: !!mapping.user_implementation_status || !!mapping.user_implementation_explanation,
        qualityScore: this.extractQualityScore(mapping.implementation_explanation)
      };
    } catch (error) {
      this.logger.warn(`Failed to get previous assessment for control ${controlId}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get assessment history for multiple controls
   */
  async getAssessmentHistory(
    appId: number,
    controlIds: number[],
    limit: number = 5
  ): Promise<Map<number, HistoricalAssessment[]>> {
    const historyMap = new Map<number, HistoricalAssessment[]>();

    try {
      // For now, get the most recent assessment for each control
      // In future, could track full history in separate table
      const mappings = await this.appControlMapRepo.find({
        where: {
          app_id: appId,
          control_id: controlIds.length > 0 ? In(controlIds) : undefined,
        },
        relations: ['control'],
        order: {
          updated_at: 'DESC'
        }
      });

      for (const mapping of mappings) {
        if (!mapping.updated_at) continue;

        const history: HistoricalAssessment = {
          controlId: mapping.control_id,
          controlName: mapping.control?.control_name || 'Unknown',
          assessmentDate: mapping.updated_at,
          implementationStatus: mapping.implementation_status || 'not_implemented',
          percentageCompletion: mapping.percentage_completion || 0,
          explanation: this.parseExplanation(mapping.implementation_explanation),
          userModified: !!mapping.user_implementation_status || !!mapping.user_implementation_explanation,
          qualityScore: this.extractQualityScore(mapping.implementation_explanation)
        };

        if (!historyMap.has(mapping.control_id)) {
          historyMap.set(mapping.control_id, []);
        }
        historyMap.get(mapping.control_id)!.push(history);
      }

      this.logger.log(`Retrieved assessment history for ${historyMap.size} controls`);
    } catch (error) {
      this.logger.error(`Failed to get assessment history: ${error.message}`, error);
    }

    return historyMap;
  }

  /**
   * Analyze changes between current and previous assessment
   */
  analyzeAssessmentChanges(
    previous: HistoricalAssessment,
    current: {
      implementationStatus: string;
      percentageCompletion: number;
      explanation: any;
    }
  ): AssessmentChangeSummary {
    const statusChanged = previous.implementationStatus !== current.implementationStatus;
    const percentageChange = current.percentageCompletion - previous.percentageCompletion;
    const daysElapsed = this.getDaysElapsed(previous.assessmentDate);

    // Determine improvement trend
    let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (percentageChange > 5) {
      improvementTrend = 'improving';
    } else if (percentageChange < -5) {
      improvementTrend = 'declining';
    }

    // Detect significant changes
    const significantChanges: string[] = [];

    if (statusChanged) {
      significantChanges.push(
        `Status changed from ${previous.implementationStatus} to ${current.implementationStatus}`
      );
    }

    if (Math.abs(percentageChange) > 10) {
      significantChanges.push(
        `Percentage completion ${percentageChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(percentageChange)}%`
      );
    }

    // Compare evidence counts
    const prevEvidenceCount = previous.explanation?.evidence_found?.length || 0;
    const currEvidenceCount = current.explanation?.evidence_found?.length || 0;
    if (currEvidenceCount > prevEvidenceCount) {
      significantChanges.push(
        `New evidence added: ${currEvidenceCount - prevEvidenceCount} additional items`
      );
    } else if (currEvidenceCount < prevEvidenceCount) {
      significantChanges.push(
        `Evidence removed: ${prevEvidenceCount - currEvidenceCount} items no longer present`
      );
    }

    // Compare gaps
    const prevGapsCount = previous.explanation?.gaps?.length || 0;
    const currGapsCount = current.explanation?.gaps?.length || 0;
    if (currGapsCount < prevGapsCount) {
      significantChanges.push(
        `Gaps reduced: ${prevGapsCount - currGapsCount} gaps addressed`
      );
    } else if (currGapsCount > prevGapsCount) {
      significantChanges.push(
        `New gaps identified: ${currGapsCount - prevGapsCount} additional gaps`
      );
    }

    return {
      controlId: previous.controlId,
      controlName: previous.controlName,
      statusChanged,
      previousStatus: previous.implementationStatus,
      currentStatus: current.implementationStatus,
      percentageChange,
      improvementTrend,
      daysElapsed,
      significantChanges
    };
  }

  /**
   * Generate historical context summary for LLM prompt
   */
  generateHistoricalContextSummary(
    previous: HistoricalAssessment,
    changeSummary?: AssessmentChangeSummary
  ): string {
    const daysAgo = this.getDaysElapsed(previous.assessmentDate);
    let summary = `## Previous Assessment Context (${daysAgo} days ago)\n\n`;

    summary += `- **Previous Status**: ${previous.implementationStatus}\n`;
    summary += `- **Previous Completion**: ${previous.percentageCompletion}%\n`;
    summary += `- **Assessment Date**: ${previous.assessmentDate.toISOString().split('T')[0]}\n`;

    if (previous.qualityScore) {
      summary += `- **Previous Quality Score**: ${previous.qualityScore}/100\n`;
    }

    if (previous.userModified) {
      summary += `- **Note**: Previous assessment was manually modified by user\n`;
    }

    if (previous.explanation) {
      const prevEvidence = previous.explanation.evidence_found || [];
      const prevGaps = previous.explanation.gaps || [];
      const prevRecs = previous.explanation.recommendations || [];

      summary += `\n### Previous Findings:\n`;
      summary += `- Evidence Items: ${prevEvidence.length}\n`;
      summary += `- Identified Gaps: ${prevGaps.length}\n`;
      summary += `- Recommendations: ${prevRecs.length}\n`;

      if (prevEvidence.length > 0) {
        summary += `\n**Previously Found Evidence:**\n`;
        prevEvidence.slice(0, 3).forEach((e: string, i: number) => {
          summary += `${i + 1}. ${e.substring(0, 100)}${e.length > 100 ? '...' : ''}\n`;
        });
      }

      if (prevGaps.length > 0) {
        summary += `\n**Previously Identified Gaps:**\n`;
        prevGaps.slice(0, 3).forEach((g: string, i: number) => {
          summary += `${i + 1}. ${g.substring(0, 100)}${g.length > 100 ? '...' : ''}\n`;
        });
      }
    }

    if (changeSummary) {
      summary += `\n### Change Analysis:\n`;
      summary += `- **Trend**: ${changeSummary.improvementTrend}\n`;
      summary += `- **Percentage Change**: ${changeSummary.percentageChange > 0 ? '+' : ''}${changeSummary.percentageChange}%\n`;

      if (changeSummary.significantChanges.length > 0) {
        summary += `\n**Significant Changes Detected:**\n`;
        changeSummary.significantChanges.forEach((change, i) => {
          summary += `${i + 1}. ${change}\n`;
        });
      }
    }

    summary += `\n**IMPORTANT FOR ANALYSIS:**\n`;
    summary += `1. Compare current findings with previous assessment\n`;
    summary += `2. If status improved, explain what evidence/changes led to improvement\n`;
    summary += `3. If status declined, explain what gaps emerged or evidence was lost\n`;
    summary += `4. If status unchanged, explain whether new evidence strengthens or weakens the assessment\n`;

    return summary;
  }

  /**
   * Check if historical assessment is stale (needs re-assessment)
   */
  isAssessmentStale(assessmentDate: Date, thresholdDays: number = 90): boolean {
    const daysElapsed = this.getDaysElapsed(assessmentDate);
    return daysElapsed > thresholdDays;
  }

  /**
   * Get assessment statistics for an application
   */
  async getAssessmentStatistics(
    appId: number,
    standardId?: number
  ): Promise<{
    totalControls: number;
    assessedControls: number;
    staleAssessments: number;
    userModifiedCount: number;
    averageQualityScore: number;
    statusDistribution: Record<string, number>;
  }> {
    try {
      const whereClause: any = { app_id: appId };
      if (standardId) {
        whereClause.standard_id = standardId;
      }

      const mappings = await this.appControlMapRepo.find({
        where: whereClause,
        relations: ['control'],
      });

      let staleCount = 0;
      let userModifiedCount = 0;
      let totalQuality = 0;
      let qualityCount = 0;
      const statusDistribution: Record<string, number> = {};

      for (const mapping of mappings) {
        // Count stale assessments
        if (mapping.updated_at && this.isAssessmentStale(mapping.updated_at)) {
          staleCount++;
        }

        // Count user modifications
        if (mapping.user_implementation_status || mapping.user_implementation_explanation) {
          userModifiedCount++;
        }

        // Calculate quality scores
        const qualityScore = this.extractQualityScore(mapping.implementation_explanation);
        if (qualityScore) {
          totalQuality += qualityScore;
          qualityCount++;
        }

        // Status distribution
        const status = mapping.implementation_status || 'not_implemented';
        statusDistribution[status] = (statusDistribution[status] || 0) + 1;
      }

      return {
        totalControls: mappings.length,
        assessedControls: mappings.filter(m => m.percentage_completion > 0).length,
        staleAssessments: staleCount,
        userModifiedCount,
        averageQualityScore: qualityCount > 0 ? totalQuality / qualityCount : 0,
        statusDistribution
      };
    } catch (error) {
      this.logger.error(`Failed to get assessment statistics: ${error.message}`, error);
      return {
        totalControls: 0,
        assessedControls: 0,
        staleAssessments: 0,
        userModifiedCount: 0,
        averageQualityScore: 0,
        statusDistribution: {}
      };
    }
  }

  /**
   * Helper: Parse explanation JSON
   */
  private parseExplanation(explanation: string | any): any {
    if (!explanation) return null;
    if (typeof explanation === 'object') return explanation;
    try {
      return JSON.parse(explanation);
    } catch {
      return { summary: explanation };
    }
  }

  /**
   * Helper: Extract quality score from explanation
   */
  private extractQualityScore(explanation: string | any): number | undefined {
    const parsed = this.parseExplanation(explanation);
    return parsed?.quality_score;
  }

  /**
   * Helper: Calculate days elapsed since date
   */
  private getDaysElapsed(date: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }
}

// Helper function to import In operator
import { In } from 'typeorm';
