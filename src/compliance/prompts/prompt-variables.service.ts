import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Control } from 'src/entities/compliance/control.entity';
import { ApplicationControlMapping } from 'src/entities/compliance/applicationControlMapping.entity';
import { App } from 'src/entities/app.entity';
import { Standard } from 'src/entities/standard_v1.entity';
import { getPromptForControl, ControlFamilyPrompt } from './control-prompts';
import { LoggerService } from 'src/logger/logger.service';
import { AssessmentHistoryService } from '../history/assessment-history.service';

export interface PromptContext {
  appId: number;
  appName: string;
  appDescription?: string;
  industryType?: string;
  complianceFramework: string;
  standardId: number;
  previousAssessments?: PreviousAssessment[];
  knownTechnologies?: string[];
  organizationPolicies?: Policy[];
  customerId: string;
}

export interface PreviousAssessment {
  status: string;
  percentage: number;
  date: Date;
  explanation?: any;
}

export interface Policy {
  name: string;
  description: string;
}

@Injectable()
export class PromptVariablesService {
  constructor(
    @InjectRepository(App)
    private readonly appRepo: Repository<App>,
    @InjectRepository(Standard)
    private readonly standardRepo: Repository<Standard>,
    @InjectRepository(ApplicationControlMapping)
    private readonly appControlMapRepo: Repository<ApplicationControlMapping>,
    private readonly logger: LoggerService,
    private readonly assessmentHistory: AssessmentHistoryService
  ) {}

  /**
   * Build complete prompt context from database
   */
  async buildPromptContext(
    appId: number,
    standardId: number,
    customerId: string
  ): Promise<PromptContext> {
    // Fetch application details
    const app = await this.appRepo.findOne({
      where: { id: appId }
    });

    // Fetch standard details
    const standard = await this.standardRepo.findOne({
      where: { id: standardId }
    });

    if (!app || !standard) {
      throw new Error(`Application ${appId} or Standard ${standardId} not found`);
    }

    // Build context
    const context: PromptContext = {
      appId,
      appName: app.name || 'Unknown Application',
      appDescription: app.desc || undefined,
      industryType: this.detectIndustry(app.desc, app.tags ? app.tags.join(' ') : undefined),
      complianceFramework: standard.name || 'Unknown Framework',
      standardId,
      customerId,
      knownTechnologies: await this.detectTechnologies(app),
    };

    return context;
  }

  /**
   * Generate context-aware prompt with all relevant variables
   */
  async generatePrompt(
    control: Control,
    sourceText: string,
    context: PromptContext,
    previousAssessment?: ApplicationControlMapping
  ): Promise<string> {
    const familyPrompt: ControlFamilyPrompt = getPromptForControl(control.control_name);

    // Build enhanced historical context section using AssessmentHistoryService
    let historicalSection = '';
    if (previousAssessment) {
      try {
        const historicalData = await this.assessmentHistory.getPreviousAssessment(
          previousAssessment.app_id,
          previousAssessment.control_id
        );

        if (historicalData) {
          historicalSection = `

${this.assessmentHistory.generateHistoricalContextSummary(historicalData)}`;
        } else {
          // Fallback to basic context
          historicalSection = `

## Previous Assessment Context
- Previous Status: ${previousAssessment.implementation_status || 'N/A'}
- Previous Completion: ${previousAssessment.percentage_completion || 0}%
- Last Assessment: ${previousAssessment.updated_at?.toISOString().split('T')[0] || 'Unknown'}

**IMPORTANT**: Compare current findings with previous assessment. If status has changed, explain why.`;
        }
      } catch (error) {
        this.logger.warn(`Failed to get historical context: ${error.message}`);
        // Fallback to basic context
        historicalSection = `

## Previous Assessment Context
- Previous Status: ${previousAssessment.implementation_status || 'N/A'}
- Previous Completion: ${previousAssessment.percentage_completion || 0}%
- Last Assessment: ${previousAssessment.updated_at?.toISOString().split('T')[0] || 'Unknown'}`;
      }
    }

    // Build technology context section
    let technologySection = '';
    if (context.knownTechnologies && context.knownTechnologies.length > 0) {
      technologySection = `

## Detected Technologies
${context.knownTechnologies.join(', ')}

**Note**: Consider these technologies when analyzing implementation.`;
    }

    // Build the complete prompt
    const prompt = `${familyPrompt.systemMessage}

# Application Context
- **Application**: ${context.appName}
${context.appDescription ? `- **Description**: ${context.appDescription}` : ''}
${context.industryType ? `- **Industry**: ${context.industryType}` : ''}
- **Compliance Framework**: ${context.complianceFramework}
${technologySection}
${historicalSection}

# Control Being Analyzed
- **Control ID**: ${control.control_name}
- **Control Title**: ${control.control_long_name || control.control_name}
- **Control Description**: ${control.control_text || 'No description provided'}
- **Control Family**: ${control.control_name.substring(0, 2)} (${this.getControlFamilyName(control.control_name)})

# Analysis Instructions
${familyPrompt.analysisInstructions}

# Source Document to Analyze
${this.truncateSourceText(sourceText)}

# Required Output Format
Return a JSON object with the following structure:
\`\`\`json
{
  "implementation_status": "<not_implemented|partially_implemented|implemented|not_applicable|planned>",
  "percentage_completion": <0-100>,
  "implementation_statement": {
    "summary": "Brief 2-3 sentence summary of implementation status",
    "current_state": "Detailed description of what is currently implemented based on source evidence",
    "evidence_found": [
      "Specific evidence item 1 from source (quote or reference)",
      "Specific evidence item 2 from source (quote or reference)",
      "..."
    ],
    "coverage_analysis": {
      "implemented_requirements": [
        "Requirement 1 that is met",
        "Requirement 2 that is met",
        "..."
      ],
      "missing_requirements": [
        "Requirement 1 that is NOT met",
        "Requirement 2 that is NOT met",
        "..."
      ]
    },
    "gaps": [
      "Specific gap 1 (be concrete, not vague)",
      "Specific gap 2 (be concrete, not vague)",
      "..."
    ],
    "recommendations": [
      {
        "priority": "high|medium|low",
        "action": "SPECIFIC, ACTIONABLE recommendation (use concrete tools/methods)",
        "rationale": "Why this is needed and what it solves"
      }
    ]
  },
  "evidence_suggestions": [
    {
      "type": "document|screenshot|configuration|policy|log|code",
      "description": "What specific evidence would strengthen this control",
      "priority": "required|recommended|optional",
      "example": "What this evidence should contain"
    }
  ],
  "confidence_score": <0-100>
}
\`\`\`

# Important Guidelines
1. **Evidence MUST come from source**: Only list evidence that actually exists in the source document. Do not hallucinate.
2. **Be Specific**: Avoid vague terms like "implement security" or "improve controls". Use concrete actions.
3. **Quote Source**: When citing evidence, reference specific parts of the source.
4. **Actionable Recommendations**: Each recommendation must be implementable within weeks, not months.
5. **Percentage Consistency**: Ensure percentage_completion matches implementation_status:
   - not_implemented: 0-20%
   - planned: 10-30%
   - partially_implemented: 30-70%
   - implemented: 80-100%
   - not_applicable: 0%
6. **Confidence Score**: Rate your confidence in the analysis (lower if source is unclear or incomplete)

${familyPrompt.evidenceKeywords && familyPrompt.evidenceKeywords.length > 0 ? `\n# Key Terms to Look For\n${familyPrompt.evidenceKeywords.join(', ')}` : ''}

Respond ONLY with valid JSON. No markdown formatting, no explanatory text before or after the JSON.`;

    return prompt;
  }

  /**
   * Detect technologies mentioned in application description or source
   */
  private async detectTechnologies(app: App): Promise<string[]> {
    const technologies: Set<string> = new Set();

    const techKeywords = {
      // Languages
      'javascript': 'JavaScript', 'typescript': 'TypeScript', 'python': 'Python',
      'java': 'Java', 'c#': 'C#', 'dotnet': '.NET', 'ruby': 'Ruby', 'php': 'PHP',
      'go': 'Go', 'golang': 'Go', 'rust': 'Rust', 'kotlin': 'Kotlin',

      // Frameworks
      'react': 'React', 'angular': 'Angular', 'vue': 'Vue.js', 'nestjs': 'NestJS',
      'express': 'Express', 'django': 'Django', 'flask': 'Flask', 'spring': 'Spring',
      'rails': 'Ruby on Rails', 'laravel': 'Laravel',

      // Databases
      'postgres': 'PostgreSQL', 'postgresql': 'PostgreSQL', 'mysql': 'MySQL',
      'mongodb': 'MongoDB', 'redis': 'Redis', 'elasticsearch': 'Elasticsearch',
      'dynamodb': 'DynamoDB', 'cassandra': 'Cassandra',

      // Cloud
      'aws': 'AWS', 'azure': 'Azure', 'gcp': 'Google Cloud', 'google cloud': 'Google Cloud',
      's3': 'AWS S3', 'ec2': 'AWS EC2', 'lambda': 'AWS Lambda', 'kubernetes': 'Kubernetes',
      'k8s': 'Kubernetes', 'docker': 'Docker',

      // Auth
      'oauth': 'OAuth', 'saml': 'SAML', 'jwt': 'JWT', 'cognito': 'AWS Cognito',
      'auth0': 'Auth0', 'okta': 'Okta', 'mfa': 'MFA', '2fa': '2FA',

      // Monitoring/Logging
      'cloudwatch': 'CloudWatch', 'datadog': 'Datadog', 'splunk': 'Splunk',
      'elk': 'ELK Stack', 'prometheus': 'Prometheus', 'grafana': 'Grafana',
    };

    const searchText = `${app.name || ''} ${app.desc || ''} ${app.tags || ''}`.toLowerCase();

    for (const [keyword, techName] of Object.entries(techKeywords)) {
      if (searchText.includes(keyword.toLowerCase())) {
        technologies.add(techName);
      }
    }

    return Array.from(technologies);
  }

  /**
   * Detect industry type from application metadata
   */
  private detectIndustry(description?: string, tags?: string): string | undefined {
    if (!description && !tags) return undefined;

    const searchText = `${description || ''} ${tags || ''}`.toLowerCase();

    const industryKeywords = {
      'healthcare': ['healthcare', 'hipaa', 'medical', 'patient', 'hospital', 'clinic'],
      'finance': ['financial', 'banking', 'payment', 'fintech', 'pci', 'transaction'],
      'government': ['government', 'federal', 'public sector', 'fedramp', 'fisma'],
      'education': ['education', 'school', 'university', 'student', 'learning'],
      'retail': ['retail', 'e-commerce', 'ecommerce', 'shopping', 'store'],
      'saas': ['saas', 'software as a service', 'cloud service', 'platform'],
      'technology': ['technology', 'software', 'tech', 'startup'],
    };

    for (const [industry, keywords] of Object.entries(industryKeywords)) {
      if (keywords.some(kw => searchText.includes(kw))) {
        return industry.charAt(0).toUpperCase() + industry.slice(1);
      }
    }

    return undefined;
  }

  /**
   * Get human-readable control family name
   */
  private getControlFamilyName(controlName: string): string {
    const familyCode = controlName.substring(0, 2).toUpperCase();
    const familyNames: Record<string, string> = {
      'AC': 'Access Control',
      'AU': 'Audit & Accountability',
      'AT': 'Awareness & Training',
      'CM': 'Configuration Management',
      'CP': 'Contingency Planning',
      'IA': 'Identification & Authentication',
      'IR': 'Incident Response',
      'MA': 'Maintenance',
      'MP': 'Media Protection',
      'PE': 'Physical & Environmental',
      'PL': 'Planning',
      'PS': 'Personnel Security',
      'RA': 'Risk Assessment',
      'SA': 'System & Services Acquisition',
      'SC': 'System & Communications Protection',
      'SI': 'System & Information Integrity',
      'PM': 'Program Management',
      'SR': 'Supply Chain Risk',
      'CA': 'Assessment & Monitoring',
    };

    return familyNames[familyCode] || 'Unknown';
  }

  /**
   * Truncate source text to fit within token limits
   */
  private truncateSourceText(sourceText: string, maxLength: number = 8000): string {
    if (sourceText.length <= maxLength) {
      return sourceText;
    }

    this.logger.warn(`Source text truncated from ${sourceText.length} to ${maxLength} characters`);

    // Truncate and add notice
    return sourceText.substring(0, maxLength) + '\n\n[... SOURCE TEXT TRUNCATED DUE TO LENGTH ...]';
  }
}
