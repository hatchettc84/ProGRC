import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { RemediationPlan, RemediationAction, Milestone } from './auto-remediation.service';

/**
 * POAM (Plan of Action and Milestones) Document
 * Standard format for compliance reporting
 */
export interface POAMDocument {
  metadata: POAMMetadata;
  weaknesses: POAMWeakness[];
  summary: POAMSummary;
  generatedAt: Date;
  formatVersion: string;
}

/**
 * POAM Metadata
 */
export interface POAMMetadata {
  systemName: string;
  complianceFramework: string;
  reportingPeriod: string;
  preparedBy: string;
  preparedDate: Date;
  reviewedBy?: string;
  approvedBy?: string;
}

/**
 * POAM Weakness Entry
 */
export interface POAMWeakness {
  weaknessId: string;
  controlId: string;
  controlName: string;
  controlFamily: string;
  weaknessDescription: string;
  riskLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  currentStatus: string;
  targetStatus: string;
  pointOfContact: string;
  resources: string;
  scheduledCompletionDate: Date;
  milestones: POAMMilestone[];
  originalDetectionDate?: Date;
  estimatedCompletionPercentage: number;
}

/**
 * POAM Milestone
 */
export interface POAMMilestone {
  milestoneId: string;
  description: string;
  scheduledCompletionDate: Date;
  status: 'Pending' | 'In Progress' | 'Complete' | 'Delayed';
  percentageOfWeakness: number;
  comments?: string;
}

/**
 * POAM Summary Statistics
 */
export interface POAMSummary {
  totalWeaknesses: number;
  criticalWeaknesses: number;
  highWeaknesses: number;
  moderateWeaknesses: number;
  lowWeaknesses: number;
  averageCompletionPercentage: number;
  onScheduleCount: number;
  delayedCount: number;
  totalEstimatedDays: number;
}

/**
 * POAM Generation Service
 *
 * Generates standardized POAM (Plan of Action and Milestones) documents
 * from remediation plans for compliance reporting
 */
@Injectable()
export class POAMGenerationService {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Generate POAM document from remediation plans
   */
  async generatePOAM(
    remediationPlans: RemediationPlan[],
    metadata: {
      systemName: string;
      complianceFramework: string;
      preparedBy: string;
    }
  ): Promise<POAMDocument> {
    const weaknesses: POAMWeakness[] = [];

    for (const plan of remediationPlans) {
      const weakness = this.convertPlanToWeakness(plan);
      weaknesses.push(weakness);
    }

    // Sort weaknesses by risk level (Critical -> High -> Moderate -> Low)
    weaknesses.sort((a, b) => {
      const riskOrder = { Critical: 1, High: 2, Moderate: 3, Low: 4 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });

    const summary = this.generateSummary(weaknesses);

    const now = new Date();
    const reportingPeriod = `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;

    this.logger.log(
      `Generated POAM document: ${weaknesses.length} weaknesses, ` +
      `${summary.criticalWeaknesses} critical, ${summary.highWeaknesses} high`
    );

    return {
      metadata: {
        systemName: metadata.systemName,
        complianceFramework: metadata.complianceFramework,
        reportingPeriod,
        preparedBy: metadata.preparedBy,
        preparedDate: now,
      },
      weaknesses,
      summary,
      generatedAt: now,
      formatVersion: '1.0',
    };
  }

  /**
   * Convert remediation plan to POAM weakness entry
   */
  private convertPlanToWeakness(plan: RemediationPlan): POAMWeakness {
    // Determine risk level based on current status and critical actions
    const riskLevel = this.determineRiskLevel(plan.currentStatus, plan.criticalActions, plan.totalActions);

    // Convert remediation actions to weakness description
    const weaknessDescription = this.generateWeaknessDescription(plan);

    // Get point of contact from actions
    const pointOfContact = this.getPrimaryPointOfContact(plan.actions);

    // Get required resources
    const resources = this.summarizeResources(plan.actions);

    // Convert milestones to POAM format
    const milestones = plan.milestones.map(m => this.convertMilestone(m));

    // Calculate estimated completion percentage (0% since not started)
    const estimatedCompletionPercentage = 0;

    return {
      weaknessId: `W-${plan.controlId.replace(/\./g, '-')}`,
      controlId: plan.controlId,
      controlName: plan.controlName,
      controlFamily: plan.controlFamily,
      weaknessDescription,
      riskLevel,
      currentStatus: this.mapStatusToHumanReadable(plan.currentStatus),
      targetStatus: this.mapStatusToHumanReadable(plan.targetStatus),
      pointOfContact,
      resources,
      scheduledCompletionDate: plan.estimatedCompletionDate,
      milestones,
      estimatedCompletionPercentage,
    };
  }

  /**
   * Determine risk level
   */
  private determineRiskLevel(
    currentStatus: string,
    criticalActions: number,
    totalActions: number
  ): 'Critical' | 'High' | 'Moderate' | 'Low' {
    // Not implemented with critical actions = Critical risk
    if (currentStatus === 'not_implemented' && criticalActions > 0) {
      return 'Critical';
    }

    // Not implemented = High risk
    if (currentStatus === 'not_implemented') {
      return 'High';
    }

    // Partially implemented with many critical actions = High risk
    if (currentStatus === 'partially_implemented' && criticalActions >= totalActions * 0.3) {
      return 'High';
    }

    // Partially implemented = Moderate risk
    if (currentStatus === 'partially_implemented') {
      return 'Moderate';
    }

    // Planned with critical actions = Moderate risk
    if (currentStatus === 'planned' && criticalActions > 0) {
      return 'Moderate';
    }

    return 'Low';
  }

  /**
   * Generate weakness description
   */
  private generateWeaknessDescription(plan: RemediationPlan): string {
    const criticalIssues: string[] = [];
    const otherIssues: string[] = [];

    for (const action of plan.actions) {
      if (action.priority === 'critical' || action.priority === 'high') {
        criticalIssues.push(action.title);
      } else {
        otherIssues.push(action.title);
      }
    }

    let description = `Control ${plan.controlName} (${plan.controlFamily} family) is currently ${plan.currentStatus.replace(/_/g, ' ')}. `;

    if (criticalIssues.length > 0) {
      description += `Critical/High priority gaps identified:\n`;
      criticalIssues.slice(0, 5).forEach((issue, i) => {
        description += `${i + 1}. ${issue}\n`;
      });
      if (criticalIssues.length > 5) {
        description += `...and ${criticalIssues.length - 5} more critical/high priority items.\n`;
      }
    }

    if (otherIssues.length > 0) {
      description += `\nAdditional improvements needed: ${otherIssues.length} medium/low priority items.`;
    }

    description += `\n\nTotal remediation actions required: ${plan.totalActions}`;

    return description;
  }

  /**
   * Get primary point of contact
   */
  private getPrimaryPointOfContact(actions: RemediationAction[]): string {
    // Get the role responsible for the most critical actions
    const roleCounts: Record<string, number> = {};

    for (const action of actions) {
      if (action.priority === 'critical' || action.priority === 'high') {
        roleCounts[action.assignedRole] = (roleCounts[action.assignedRole] || 0) + 1;
      }
    }

    if (Object.keys(roleCounts).length === 0) {
      return 'Compliance Team';
    }

    // Return role with most critical/high actions
    return Object.entries(roleCounts).sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Summarize required resources
   */
  private summarizeResources(actions: RemediationAction[]): string {
    const resourceTypes: Set<string> = new Set();
    const tools: Set<string> = new Set();

    for (const action of actions) {
      for (const resource of action.resources) {
        if (resource.type === 'tool' || resource.type === 'service') {
          tools.add(resource.name);
        }
        resourceTypes.add(action.assignedRole);
      }
    }

    let summary = `Personnel: ${Array.from(resourceTypes).join(', ')}`;

    if (tools.size > 0) {
      summary += `; Tools/Services: ${Array.from(tools).slice(0, 5).join(', ')}`;
      if (tools.size > 5) {
        summary += ` and ${tools.size - 5} more`;
      }
    }

    return summary;
  }

  /**
   * Convert milestone to POAM format
   */
  private convertMilestone(milestone: Milestone): POAMMilestone {
    return {
      milestoneId: milestone.id,
      description: milestone.description,
      scheduledCompletionDate: milestone.targetDate,
      status: 'Pending',
      percentageOfWeakness: milestone.percentageOfPlan,
      comments: `Includes ${milestone.completedActions.length} remediation actions`,
    };
  }

  /**
   * Map status to human-readable
   */
  private mapStatusToHumanReadable(status: string): string {
    const statusMap: Record<string, string> = {
      not_implemented: 'Not Implemented',
      planned: 'Planned',
      partially_implemented: 'Partially Implemented',
      implemented: 'Implemented',
      not_applicable: 'Not Applicable',
    };
    return statusMap[status] || status;
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(weaknesses: POAMWeakness[]): POAMSummary {
    const summary: POAMSummary = {
      totalWeaknesses: weaknesses.length,
      criticalWeaknesses: 0,
      highWeaknesses: 0,
      moderateWeaknesses: 0,
      lowWeaknesses: 0,
      averageCompletionPercentage: 0,
      onScheduleCount: 0,
      delayedCount: 0,
      totalEstimatedDays: 0,
    };

    let totalCompletion = 0;
    const now = new Date();

    for (const weakness of weaknesses) {
      // Count by risk level
      switch (weakness.riskLevel) {
        case 'Critical':
          summary.criticalWeaknesses++;
          break;
        case 'High':
          summary.highWeaknesses++;
          break;
        case 'Moderate':
          summary.moderateWeaknesses++;
          break;
        case 'Low':
          summary.lowWeaknesses++;
          break;
      }

      totalCompletion += weakness.estimatedCompletionPercentage;

      // Count schedule status
      if (weakness.scheduledCompletionDate < now) {
        summary.delayedCount++;
      } else {
        summary.onScheduleCount++;
      }

      // Calculate total days
      const daysUntilCompletion = Math.ceil(
        (weakness.scheduledCompletionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      summary.totalEstimatedDays += Math.max(0, daysUntilCompletion);
    }

    summary.averageCompletionPercentage =
      weaknesses.length > 0 ? Math.round(totalCompletion / weaknesses.length) : 0;

    return summary;
  }

  /**
   * Export POAM to formatted text
   */
  exportPOAMToText(poam: POAMDocument): string {
    let output = '';

    // Header
    output += '='.repeat(80) + '\n';
    output += 'PLAN OF ACTION AND MILESTONES (POA&M)\n';
    output += '='.repeat(80) + '\n\n';

    // Metadata
    output += `System Name: ${poam.metadata.systemName}\n`;
    output += `Compliance Framework: ${poam.metadata.complianceFramework}\n`;
    output += `Reporting Period: ${poam.metadata.reportingPeriod}\n`;
    output += `Prepared By: ${poam.metadata.preparedBy}\n`;
    output += `Prepared Date: ${poam.metadata.preparedDate.toISOString().split('T')[0]}\n`;
    output += `Generated: ${poam.generatedAt.toISOString()}\n`;
    output += '\n';

    // Summary
    output += '-'.repeat(80) + '\n';
    output += 'EXECUTIVE SUMMARY\n';
    output += '-'.repeat(80) + '\n\n';
    output += `Total Weaknesses: ${poam.summary.totalWeaknesses}\n`;
    output += `  - Critical: ${poam.summary.criticalWeaknesses}\n`;
    output += `  - High: ${poam.summary.highWeaknesses}\n`;
    output += `  - Moderate: ${poam.summary.moderateWeaknesses}\n`;
    output += `  - Low: ${poam.summary.lowWeaknesses}\n\n`;
    output += `Average Completion: ${poam.summary.averageCompletionPercentage}%\n`;
    output += `On Schedule: ${poam.summary.onScheduleCount} | Delayed: ${poam.summary.delayedCount}\n`;
    output += `Total Estimated Days: ${poam.summary.totalEstimatedDays}\n\n`;

    // Weaknesses
    output += '='.repeat(80) + '\n';
    output += 'WEAKNESSES AND REMEDIATION PLANS\n';
    output += '='.repeat(80) + '\n\n';

    for (let i = 0; i < poam.weaknesses.length; i++) {
      const weakness = poam.weaknesses[i];

      output += `${i + 1}. ${weakness.weaknessId} - ${weakness.controlName}\n`;
      output += '-'.repeat(80) + '\n';
      output += `Control Family: ${weakness.controlFamily}\n`;
      output += `Risk Level: ${weakness.riskLevel}\n`;
      output += `Current Status: ${weakness.currentStatus}\n`;
      output += `Target Status: ${weakness.targetStatus}\n`;
      output += `Point of Contact: ${weakness.pointOfContact}\n`;
      output += `Scheduled Completion: ${weakness.scheduledCompletionDate.toISOString().split('T')[0]}\n`;
      output += `Completion: ${weakness.estimatedCompletionPercentage}%\n\n`;

      output += `Description:\n${weakness.weaknessDescription}\n\n`;

      output += `Resources Required:\n${weakness.resources}\n\n`;

      output += `Milestones:\n`;
      for (const milestone of weakness.milestones) {
        output += `  - [${milestone.status}] ${milestone.description}\n`;
        output += `    Target: ${milestone.scheduledCompletionDate.toISOString().split('T')[0]}\n`;
        output += `    Progress: ${milestone.percentageOfWeakness}% of weakness remediation\n`;
        if (milestone.comments) {
          output += `    Notes: ${milestone.comments}\n`;
        }
      }

      output += '\n';
    }

    output += '='.repeat(80) + '\n';
    output += 'END OF REPORT\n';
    output += '='.repeat(80) + '\n';

    return output;
  }

  /**
   * Export POAM to JSON format
   */
  exportPOAMToJSON(poam: POAMDocument): string {
    return JSON.stringify(poam, null, 2);
  }

  /**
   * Export POAM to CSV format
   */
  exportPOAMToCSV(poam: POAMDocument): string {
    let csv = 'Weakness ID,Control ID,Control Name,Control Family,Risk Level,Current Status,Target Status,POC,Scheduled Completion,Completion %,Milestone Count\n';

    for (const weakness of poam.weaknesses) {
      const row = [
        weakness.weaknessId,
        weakness.controlId,
        `"${weakness.controlName}"`,
        weakness.controlFamily,
        weakness.riskLevel,
        weakness.currentStatus,
        weakness.targetStatus,
        `"${weakness.pointOfContact}"`,
        weakness.scheduledCompletionDate.toISOString().split('T')[0],
        weakness.estimatedCompletionPercentage,
        weakness.milestones.length,
      ].join(',');
      csv += row + '\n';
    }

    return csv;
  }
}
