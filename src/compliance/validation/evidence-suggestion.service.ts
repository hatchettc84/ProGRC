import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import { getPromptForControl } from '../prompts/control-prompts';

/**
 * Evidence types
 */
export enum EvidenceType {
  DOCUMENT = 'document',
  SCREENSHOT = 'screenshot',
  CONFIGURATION = 'configuration',
  POLICY = 'policy',
  LOG = 'log',
  CODE = 'code',
  DIAGRAM = 'diagram',
  AUDIT_REPORT = 'audit_report',
  TRAINING_RECORD = 'training_record',
  ACCESS_LOG = 'access_log',
}

/**
 * Evidence priority
 */
export enum EvidencePriority {
  REQUIRED = 'required',
  RECOMMENDED = 'recommended',
  OPTIONAL = 'optional',
}

/**
 * Evidence suggestion
 */
export interface EvidenceSuggestion {
  type: EvidenceType;
  description: string;
  priority: EvidencePriority;
  example: string;
  rationale: string;
  controlFamily: string;
}

/**
 * Evidence Suggestion Service
 *
 * Automatically suggests specific evidence that would strengthen compliance
 * Based on control family, implementation status, and identified gaps
 */
@Injectable()
export class EvidenceSuggestionService {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Generate evidence suggestions for a control
   */
  async generateEvidenceSuggestions(
    controlName: string,
    implementationStatus: string,
    gaps: string[],
    currentEvidence: string[]
  ): Promise<EvidenceSuggestion[]> {
    const familyCode = controlName.substring(0, 2).toUpperCase();
    const familyPrompt = getPromptForControl(controlName);

    // Get base suggestions for control family
    const baseSuggestions = this.getBaseSuggestionsForFamily(familyCode);

    // Add gap-specific suggestions
    const gapSuggestions = this.generateGapSpecificSuggestions(gaps, familyCode);

    // Filter out evidence types that are already provided
    const allSuggestions = [...baseSuggestions, ...gapSuggestions];
    const filteredSuggestions = this.filterExistingEvidence(
      allSuggestions,
      currentEvidence
    );

    // Prioritize based on implementation status
    const prioritizedSuggestions = this.prioritizeSuggestions(
      filteredSuggestions,
      implementationStatus
    );

    this.logger.debug(
      `Generated ${prioritizedSuggestions.length} evidence suggestions for ${controlName}`
    );

    return prioritizedSuggestions;
  }

  /**
   * Get base evidence suggestions for each control family
   */
  private getBaseSuggestionsForFamily(familyCode: string): EvidenceSuggestion[] {
    const suggestions: Record<string, EvidenceSuggestion[]> = {
      AC: [ // Access Control
        {
          type: EvidenceType.POLICY,
          description: 'Access control policy document defining roles, permissions, and authorization rules',
          priority: EvidencePriority.REQUIRED,
          example: 'Access Control Policy v2.1 defining RBAC model with role definitions',
          rationale: 'Demonstrates formal access control requirements and authorization framework',
          controlFamily: 'AC'
        },
        {
          type: EvidenceType.CONFIGURATION,
          description: 'IAM role definitions and permission configurations',
          priority: EvidencePriority.REQUIRED,
          example: 'AWS IAM roles JSON export showing least-privilege permissions',
          rationale: 'Proves technical implementation of access controls',
          controlFamily: 'AC'
        },
        {
          type: EvidenceType.SCREENSHOT,
          description: 'Screenshots of user authentication flows (login, MFA)',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Screenshot showing MFA challenge during login',
          rationale: 'Visual evidence of authentication mechanisms',
          controlFamily: 'AC'
        },
        {
          type: EvidenceType.ACCESS_LOG,
          description: 'Access logs showing authentication attempts and authorization checks',
          priority: EvidencePriority.RECOMMENDED,
          example: 'CloudTrail logs showing IAM authentication events',
          rationale: 'Demonstrates monitoring and logging of access events',
          controlFamily: 'AC'
        },
      ],
      AU: [ // Audit & Accountability
        {
          type: EvidenceType.CONFIGURATION,
          description: 'Logging configuration showing what events are captured',
          priority: EvidencePriority.REQUIRED,
          example: 'CloudWatch Logs configuration with event filters and retention policy',
          rationale: 'Proves audit logging is configured and operational',
          controlFamily: 'AU'
        },
        {
          type: EvidenceType.LOG,
          description: 'Sample audit logs demonstrating event capture',
          priority: EvidencePriority.REQUIRED,
          example: 'Sample audit log entries showing user actions with timestamps and user IDs',
          rationale: 'Demonstrates audit log content and format',
          controlFamily: 'AU'
        },
        {
          type: EvidenceType.POLICY,
          description: 'Audit and logging policy defining retention, review frequency',
          priority: EvidencePriority.REQUIRED,
          example: 'Audit Log Policy defining 1-year retention and quarterly reviews',
          rationale: 'Establishes formal audit requirements and processes',
          controlFamily: 'AU'
        },
        {
          type: EvidenceType.SCREENSHOT,
          description: 'Screenshots of monitoring dashboards showing audit event tracking',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Datadog dashboard showing audit event metrics over time',
          rationale: 'Visual confirmation of audit monitoring capabilities',
          controlFamily: 'AU'
        },
      ],
      IR: [ // Incident Response
        {
          type: EvidenceType.DOCUMENT,
          description: 'Incident response plan with roles, escalation procedures, and playbooks',
          priority: EvidencePriority.REQUIRED,
          example: 'IR Plan v3.0 with security incident classification and response workflows',
          rationale: 'Demonstrates formal incident response procedures',
          controlFamily: 'IR'
        },
        {
          type: EvidenceType.DOCUMENT,
          description: 'Recent incident response reports or post-mortem analyses',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Q2 2024 Security Incident Report with lessons learned',
          rationale: 'Proves incident response plan is actively used',
          controlFamily: 'IR'
        },
        {
          type: EvidenceType.TRAINING_RECORD,
          description: 'Incident response training records for security team',
          priority: EvidencePriority.RECOMMENDED,
          example: 'IR tabletop exercise completion records for security team',
          rationale: 'Shows team is trained on incident response procedures',
          controlFamily: 'IR'
        },
        {
          type: EvidenceType.CONFIGURATION,
          description: 'Alerting and monitoring configurations for security events',
          priority: EvidencePriority.REQUIRED,
          example: 'PagerDuty integration with security monitoring for 24/7 alerting',
          rationale: 'Demonstrates technical capability to detect and respond to incidents',
          controlFamily: 'IR'
        },
      ],
      IA: [ // Identification & Authentication
        {
          type: EvidenceType.CONFIGURATION,
          description: 'Authentication provider configuration (SSO, IdP)',
          priority: EvidencePriority.REQUIRED,
          example: 'Okta SSO configuration with SAML integration',
          rationale: 'Proves centralized authentication implementation',
          controlFamily: 'IA'
        },
        {
          type: EvidenceType.POLICY,
          description: 'Password policy and MFA requirements',
          priority: EvidencePriority.REQUIRED,
          example: 'Password Policy requiring 12+ chars, MFA for all users',
          rationale: 'Establishes authentication security requirements',
          controlFamily: 'IA'
        },
        {
          type: EvidenceType.SCREENSHOT,
          description: 'MFA enrollment process and authentication flow',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Screenshots showing MFA setup with authenticator app',
          rationale: 'Visual evidence of MFA implementation',
          controlFamily: 'IA'
        },
        {
          type: EvidenceType.LOG,
          description: 'Authentication logs showing MFA usage and failed login attempts',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Auth0 logs showing MFA challenges and lockout after failed attempts',
          rationale: 'Demonstrates authentication controls are enforced',
          controlFamily: 'IA'
        },
      ],
      RA: [ // Risk Assessment
        {
          type: EvidenceType.DOCUMENT,
          description: 'Risk assessment report with identified risks and mitigation strategies',
          priority: EvidencePriority.REQUIRED,
          example: 'Annual Risk Assessment Report 2024 with risk register',
          rationale: 'Demonstrates formal risk assessment process',
          controlFamily: 'RA'
        },
        {
          type: EvidenceType.DOCUMENT,
          description: 'Risk register with risk scores and treatment plans',
          priority: EvidencePriority.REQUIRED,
          example: 'Risk Register tracking 25 identified risks with CVSS scores',
          rationale: 'Shows ongoing risk tracking and management',
          controlFamily: 'RA'
        },
        {
          type: EvidenceType.DOCUMENT,
          description: 'Vulnerability scan reports from security tools',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Quarterly vulnerability scan results from Qualys',
          rationale: 'Provides technical risk identification evidence',
          controlFamily: 'RA'
        },
        {
          type: EvidenceType.AUDIT_REPORT,
          description: 'Third-party security audit or penetration test reports',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Annual penetration test report with remediation status',
          rationale: 'Independent validation of security posture',
          controlFamily: 'RA'
        },
      ],
      SC: [ // System & Communications Protection
        {
          type: EvidenceType.CONFIGURATION,
          description: 'TLS/SSL configuration and certificate management',
          priority: EvidencePriority.REQUIRED,
          example: 'Load balancer configuration enforcing TLS 1.2+ with certificate rotation',
          rationale: 'Proves encryption in transit implementation',
          controlFamily: 'SC'
        },
        {
          type: EvidenceType.CONFIGURATION,
          description: 'Firewall and network security group rules',
          priority: EvidencePriority.REQUIRED,
          example: 'AWS Security Group rules restricting ingress to ports 443 only',
          rationale: 'Demonstrates network boundary protection',
          controlFamily: 'SC'
        },
        {
          type: EvidenceType.DIAGRAM,
          description: 'Network architecture diagram showing security zones',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Network diagram with DMZ, private subnets, and security appliances',
          rationale: 'Visual representation of network security architecture',
          controlFamily: 'SC'
        },
        {
          type: EvidenceType.SCREENSHOT,
          description: 'DDoS protection and rate limiting configurations',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Cloudflare rate limiting rules protecting API endpoints',
          rationale: 'Shows protection against network-based attacks',
          controlFamily: 'SC'
        },
      ],
      SI: [ // System & Information Integrity
        {
          type: EvidenceType.DOCUMENT,
          description: 'Patch management policy and procedures',
          priority: EvidencePriority.REQUIRED,
          example: 'Patch Management Policy requiring critical patches within 7 days',
          rationale: 'Establishes system integrity maintenance requirements',
          controlFamily: 'SI'
        },
        {
          type: EvidenceType.LOG,
          description: 'Patch deployment logs or system update records',
          priority: EvidencePriority.REQUIRED,
          example: 'AWS Systems Manager patch compliance reports',
          rationale: 'Proves patches are regularly applied',
          controlFamily: 'SI'
        },
        {
          type: EvidenceType.CONFIGURATION,
          description: 'Malware detection and prevention tool configurations',
          priority: EvidencePriority.REQUIRED,
          example: 'Endpoint protection configuration with real-time scanning enabled',
          rationale: 'Demonstrates malware protection implementation',
          controlFamily: 'SI'
        },
        {
          type: EvidenceType.DOCUMENT,
          description: 'Vulnerability management process documentation',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Vulnerability Management Procedure with SLA for remediation',
          rationale: 'Shows systematic approach to vulnerability handling',
          controlFamily: 'SI'
        },
      ],
      CM: [ // Configuration Management
        {
          type: EvidenceType.DOCUMENT,
          description: 'Configuration management plan and baseline documentation',
          priority: EvidencePriority.REQUIRED,
          example: 'CM Plan defining baseline configurations for all system components',
          rationale: 'Establishes formal configuration management process',
          controlFamily: 'CM'
        },
        {
          type: EvidenceType.CODE,
          description: 'Infrastructure-as-Code templates (Terraform, CloudFormation)',
          priority: EvidencePriority.REQUIRED,
          example: 'Terraform modules defining standardized infrastructure configurations',
          rationale: 'Demonstrates automated, version-controlled configuration management',
          controlFamily: 'CM'
        },
        {
          type: EvidenceType.SCREENSHOT,
          description: 'Configuration management tool dashboard (Ansible, Chef, Puppet)',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Ansible Tower dashboard showing configuration compliance',
          rationale: 'Visual evidence of configuration automation',
          controlFamily: 'CM'
        },
        {
          type: EvidenceType.LOG,
          description: 'Change logs showing configuration changes and approvals',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Git commit history with change approval comments',
          rationale: 'Demonstrates controlled configuration change process',
          controlFamily: 'CM'
        },
      ],
      AT: [ // Awareness & Training
        {
          type: EvidenceType.DOCUMENT,
          description: 'Security awareness training program documentation',
          priority: EvidencePriority.REQUIRED,
          example: 'Annual Security Training Program with curriculum and schedule',
          rationale: 'Establishes formal training requirements',
          controlFamily: 'AT'
        },
        {
          type: EvidenceType.TRAINING_RECORD,
          description: 'Training completion records for employees',
          priority: EvidencePriority.REQUIRED,
          example: 'Security awareness training completion report showing 95% completion',
          rationale: 'Proves training is delivered and tracked',
          controlFamily: 'AT'
        },
        {
          type: EvidenceType.DOCUMENT,
          description: 'Security awareness training materials (slides, videos)',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Q2 Phishing Awareness Training presentation deck',
          rationale: 'Shows training content and quality',
          controlFamily: 'AT'
        },
        {
          type: EvidenceType.DOCUMENT,
          description: 'Role-specific security training for privileged users',
          priority: EvidencePriority.RECOMMENDED,
          example: 'Admin Security Training module for privileged access users',
          rationale: 'Demonstrates tailored training for high-risk roles',
          controlFamily: 'AT'
        },
      ],
    };

    return suggestions[familyCode] || this.getDefaultSuggestions(familyCode);
  }

  /**
   * Generate suggestions based on identified gaps
   */
  private generateGapSpecificSuggestions(
    gaps: string[],
    familyCode: string
  ): EvidenceSuggestion[] {
    const suggestions: EvidenceSuggestion[] = [];

    for (const gap of gaps) {
      const gapLower = gap.toLowerCase();

      // Documentation gaps
      if (gapLower.includes('documentation') || gapLower.includes('document')) {
        suggestions.push({
          type: EvidenceType.DOCUMENT,
          description: `Documentation addressing: ${gap}`,
          priority: EvidencePriority.REQUIRED,
          example: `Detailed documentation covering ${gap.substring(0, 50)}`,
          rationale: 'Addresses identified documentation gap',
          controlFamily: familyCode
        });
      }

      // Policy gaps
      if (gapLower.includes('policy') || gapLower.includes('procedure')) {
        suggestions.push({
          type: EvidenceType.POLICY,
          description: `Policy document for: ${gap}`,
          priority: EvidencePriority.REQUIRED,
          example: `Formal policy addressing ${gap.substring(0, 50)}`,
          rationale: 'Addresses identified policy gap',
          controlFamily: familyCode
        });
      }

      // Configuration gaps
      if (gapLower.includes('configuration') || gapLower.includes('setting') || gapLower.includes('implement')) {
        suggestions.push({
          type: EvidenceType.CONFIGURATION,
          description: `Configuration evidence for: ${gap}`,
          priority: EvidencePriority.REQUIRED,
          example: `Configuration export showing implementation of ${gap.substring(0, 50)}`,
          rationale: 'Addresses identified configuration gap',
          controlFamily: familyCode
        });
      }

      // Logging/Monitoring gaps
      if (gapLower.includes('log') || gapLower.includes('monitor') || gapLower.includes('audit trail')) {
        suggestions.push({
          type: EvidenceType.LOG,
          description: `Logging evidence for: ${gap}`,
          priority: EvidencePriority.REQUIRED,
          example: `Log samples demonstrating ${gap.substring(0, 50)}`,
          rationale: 'Addresses identified logging gap',
          controlFamily: familyCode
        });
      }

      // Training gaps
      if (gapLower.includes('training') || gapLower.includes('awareness')) {
        suggestions.push({
          type: EvidenceType.TRAINING_RECORD,
          description: `Training records for: ${gap}`,
          priority: EvidencePriority.REQUIRED,
          example: `Training completion records addressing ${gap.substring(0, 50)}`,
          rationale: 'Addresses identified training gap',
          controlFamily: familyCode
        });
      }
    }

    return suggestions;
  }

  /**
   * Filter out evidence types already provided
   */
  private filterExistingEvidence(
    suggestions: EvidenceSuggestion[],
    currentEvidence: string[]
  ): EvidenceSuggestion[] {
    // Simple heuristic: if evidence contains keywords from suggestion, filter it out
    return suggestions.filter(suggestion => {
      const hasExistingEvidence = currentEvidence.some(evidence => {
        const evidenceLower = evidence.toLowerCase();
        const descLower = suggestion.description.toLowerCase();
        // Extract key words from suggestion
        const keyWords = descLower.split(/\s+/).filter(w => w.length > 4);
        // If 30%+ of key words found in evidence, assume it's covered
        const matchCount = keyWords.filter(kw => evidenceLower.includes(kw)).length;
        return matchCount >= keyWords.length * 0.3;
      });
      return !hasExistingEvidence;
    });
  }

  /**
   * Prioritize suggestions based on implementation status
   */
  private prioritizeSuggestions(
    suggestions: EvidenceSuggestion[],
    implementationStatus: string
  ): EvidenceSuggestion[] {
    // For not_implemented or partially_implemented, prioritize REQUIRED evidence
    if (implementationStatus === 'not_implemented' || implementationStatus === 'partially_implemented') {
      return suggestions.sort((a, b) => {
        const priorityOrder = {
          [EvidencePriority.REQUIRED]: 1,
          [EvidencePriority.RECOMMENDED]: 2,
          [EvidencePriority.OPTIONAL]: 3
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    }

    // For implemented, show RECOMMENDED and OPTIONAL to strengthen evidence
    return suggestions.filter(s =>
      s.priority === EvidencePriority.RECOMMENDED ||
      s.priority === EvidencePriority.OPTIONAL
    );
  }

  /**
   * Get default suggestions for unknown control families
   */
  private getDefaultSuggestions(familyCode: string): EvidenceSuggestion[] {
    return [
      {
        type: EvidenceType.POLICY,
        description: 'Policy document relevant to this control',
        priority: EvidencePriority.REQUIRED,
        example: 'Formal policy addressing control requirements',
        rationale: 'Establishes formal requirements and procedures',
        controlFamily: familyCode
      },
      {
        type: EvidenceType.CONFIGURATION,
        description: 'Technical configuration showing control implementation',
        priority: EvidencePriority.REQUIRED,
        example: 'Configuration export or screenshots',
        rationale: 'Demonstrates technical implementation',
        controlFamily: familyCode
      },
      {
        type: EvidenceType.DOCUMENT,
        description: 'Supporting documentation or procedures',
        priority: EvidencePriority.RECOMMENDED,
        example: 'Procedure document or runbook',
        rationale: 'Provides operational context',
        controlFamily: familyCode
      },
    ];
  }
}
