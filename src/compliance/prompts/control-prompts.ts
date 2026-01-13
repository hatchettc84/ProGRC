/**
 * Control-Family-Specific Prompts for LLM-Generated Implementation Statements
 *
 * Each control family (AC, AU, IR, etc.) has specialized prompts optimized for that domain.
 * This dramatically improves the quality and accuracy of LLM-generated compliance statements.
 */

export enum ControlFamily {
  ACCESS_CONTROL = 'AC',
  AUDIT_ACCOUNTABILITY = 'AU',
  AWARENESS_TRAINING = 'AT',
  CONFIGURATION_MANAGEMENT = 'CM',
  CONTINGENCY_PLANNING = 'CP',
  IDENTIFICATION_AUTHENTICATION = 'IA',
  INCIDENT_RESPONSE = 'IR',
  MAINTENANCE = 'MA',
  MEDIA_PROTECTION = 'MP',
  PHYSICAL_ENVIRONMENTAL = 'PE',
  PLANNING = 'PL',
  PERSONNEL_SECURITY = 'PS',
  RISK_ASSESSMENT = 'RA',
  SYSTEM_SERVICES_ACQUISITION = 'SA',
  SYSTEM_COMMUNICATIONS_PROTECTION = 'SC',
  SYSTEM_INFORMATION_INTEGRITY = 'SI',
  PROGRAM_MANAGEMENT = 'PM',
  SUPPLY_CHAIN_RISK = 'SR',
  ASSESSMENT_MONITORING = 'CA',
  SECURITY_ASSESSMENT = 'CA',
}

export interface ControlFamilyPrompt {
  systemMessage: string;
  analysisInstructions: string;
  evidenceKeywords: string[];
  implementationTemplate: string;
  requiredOutputFields: string[];
}

export const CONTROL_FAMILY_PROMPTS: Record<string, ControlFamilyPrompt> = {
  // ========================================
  // ACCESS CONTROL (AC)
  // ========================================
  [ControlFamily.ACCESS_CONTROL]: {
    systemMessage: `You are an expert in access control, identity management, and authorization systems.
Focus on: authentication mechanisms, authorization policies, role-based access control (RBAC), attribute-based access control (ABAC), least privilege principles, separation of duties, and access logging.`,

    analysisInstructions: `When analyzing access control implementations:
1. **Authentication Methods**: Identify SSO, MFA, password policies, biometrics
2. **Authorization Logic**: Look for RBAC, ABAC, ACLs, permission systems
3. **Session Management**: Check session timeouts, token management, logout procedures
4. **Least Privilege**: Verify principle of least privilege implementation
5. **Access Logging**: Look for authentication logs, authorization decisions, access attempts
6. **Segregation of Duties**: Check for role separation and conflicting permission prevention
7. **Account Management**: Review user provisioning, deprovisioning, periodic reviews
8. **Remote Access**: Identify VPN, remote desktop, or cloud access controls`,

    evidenceKeywords: [
      'authentication', 'authorization', 'RBAC', 'SSO', 'MFA', 'OAuth', 'JWT',
      'access control', 'permissions', 'roles', 'ACL', 'IAM', 'login', 'logout',
      'session', 'token', 'password', 'biometric', 'least privilege', 'separation of duties'
    ],

    implementationTemplate: `## Implementation Status: {status}

### Authentication Implementation:
{auth_implementation}

### Authorization Implementation:
{authz_implementation}

### Evidence Found:
{evidence_list}

### Coverage Analysis:
- Authentication Mechanisms: {auth_coverage}%
- Authorization Controls: {authz_coverage}%
- Access Logging: {logging_coverage}%
- Account Management: {account_mgmt_coverage}%

### Gaps Identified:
{gaps_list}

### Recommendations:
{recommendations_list}

### Overall Completion: {percentage}%`,

    requiredOutputFields: [
      'authentication_methods',
      'authorization_model',
      'access_logging',
      'privilege_level',
      'session_management'
    ]
  },

  // ========================================
  // AUDIT & ACCOUNTABILITY (AU)
  // ========================================
  [ControlFamily.AUDIT_ACCOUNTABILITY]: {
    systemMessage: `You are an expert in audit logging, accountability, and security event monitoring.
Focus on: event logging, log retention, audit trails, SIEM integration, log protection, non-repudiation, and forensic capabilities.`,

    analysisInstructions: `When analyzing audit and accountability:
1. **Logging Scope**: Identify what events are logged (auth, access, changes, errors)
2. **Log Retention**: Check retention policies and durations
3. **Audit Trail**: Verify completeness and tamper-protection of audit trails
4. **Log Protection**: Look for log encryption, integrity checks, access controls
5. **Automated Analysis**: Check for SIEM, log aggregation, alerting
6. **Accountability**: Verify user attribution, non-repudiation mechanisms
7. **Review Process**: Look for periodic log review procedures
8. **Forensic Capability**: Check log format, searchability, reconstruction ability`,

    evidenceKeywords: [
      'logging', 'audit', 'SIEM', 'log retention', 'audit trail', 'accountability',
      'event log', 'access log', 'security log', 'syslog', 'CloudWatch', 'Splunk',
      'ELK', 'log analysis', 'log monitoring', 'forensics', 'tamper-proof'
    ],

    implementationTemplate: `## Implementation Status: {status}

### Logging Scope:
{logging_scope}

### Audit Trail Coverage:
{audit_coverage}

### Retention Policy:
{retention_info}

### Log Protection:
{protection_mechanisms}

### Analysis Capabilities:
{analysis_tools}

### Evidence Found:
{evidence_list}

### Gaps:
{gaps}

### Recommendations:
{recommendations}

### Overall Completion: {percentage}%`,

    requiredOutputFields: [
      'events_logged',
      'retention_period',
      'log_protection',
      'siem_integration',
      'review_frequency'
    ]
  },

  // ========================================
  // AWARENESS & TRAINING (AT)
  // ========================================
  [ControlFamily.AWARENESS_TRAINING]: {
    systemMessage: `You are an expert in security awareness and training programs.
Focus on: security training content, training frequency, role-based training, phishing awareness, insider threat awareness, and training effectiveness measurement.`,

    analysisInstructions: `When analyzing awareness and training:
1. **Training Program**: Identify formal security training programs
2. **Training Content**: Look for topics covered (phishing, passwords, data handling, etc.)
3. **Frequency**: Check training schedule and recurrence
4. **Role-Based Training**: Verify specialized training for admins, developers, etc.
5. **Effectiveness Metrics**: Look for completion tracking, testing, simulations
6. **Awareness Materials**: Check for posters, newsletters, reminders
7. **Phishing Simulations**: Look for simulated phishing campaigns
8. **Insider Threat**: Check for insider threat awareness content`,

    evidenceKeywords: [
      'training', 'awareness', 'education', 'phishing', 'security training',
      'onboarding', 'annual training', 'role-based training', 'simulation',
      'security awareness', 'compliance training', 'certification', 'LMS'
    ],

    implementationTemplate: `## Implementation Status: {status}

### Training Program:
{program_description}

### Training Frequency:
{frequency}

### Topics Covered:
{topics_list}

### Evidence Found:
{evidence_list}

### Gaps:
{gaps}

### Recommendations:
{recommendations}

### Overall Completion: {percentage}%`,

    requiredOutputFields: [
      'training_program_exists',
      'training_frequency',
      'topics_covered',
      'role_based_training',
      'effectiveness_tracking'
    ]
  },

  // ========================================
  // CONFIGURATION MANAGEMENT (CM)
  // ========================================
  [ControlFamily.CONFIGURATION_MANAGEMENT]: {
    systemMessage: `You are an expert in configuration management and baseline controls.
Focus on: baseline configurations, change control, configuration monitoring, patch management, vulnerability management, and configuration documentation.`,

    analysisInstructions: `When analyzing configuration management:
1. **Baseline Configurations**: Look for documented baseline configs for systems
2. **Change Control**: Identify change management processes and tools
3. **Configuration Monitoring**: Check for drift detection, compliance scanning
4. **Patch Management**: Look for patch policies, schedules, vulnerability scanning
5. **Version Control**: Check for infrastructure-as-code, GitOps, config repos
6. **Documentation**: Verify system diagrams, config docs, inventory
7. **Automated Deployment**: Look for CI/CD, IaC tools (Terraform, Ansible)
8. **Security Hardening**: Check for CIS benchmarks, STIGs, hardening guides`,

    evidenceKeywords: [
      'configuration', 'baseline', 'change control', 'patch', 'vulnerability',
      'Terraform', 'Ansible', 'Chef', 'Puppet', 'GitOps', 'IaC', 'CI/CD',
      'version control', 'config drift', 'hardening', 'CIS', 'STIG'
    ],

    implementationTemplate: `## Implementation Status: {status}

### Baseline Configuration:
{baseline_info}

### Change Control Process:
{change_control}

### Patch Management:
{patch_management}

### Evidence Found:
{evidence_list}

### Gaps:
{gaps}

### Recommendations:
{recommendations}

### Overall Completion: {percentage}%`,

    requiredOutputFields: [
      'baseline_documented',
      'change_control_process',
      'patch_frequency',
      'config_monitoring',
      'iac_usage'
    ]
  },

  // ========================================
  // INCIDENT RESPONSE (IR)
  // ========================================
  [ControlFamily.INCIDENT_RESPONSE]: {
    systemMessage: `You are an expert in incident response and security event handling.
Focus on: incident detection, response procedures, escalation paths, incident tracking, post-incident analysis, and IR team structure.`,

    analysisInstructions: `When analyzing incident response:
1. **IR Plan**: Look for documented incident response procedures
2. **Detection Capabilities**: Identify alerting, monitoring, detection tools
3. **Response Team**: Check for defined IR team, roles, contact info
4. **Escalation Process**: Look for severity levels, escalation paths
5. **Incident Tracking**: Check for ticketing, incident logs, status tracking
6. **Communication Plan**: Verify internal/external communication procedures
7. **Forensics**: Look for evidence collection, chain of custody
8. **Post-Incident Review**: Check for lessons learned, process improvements`,

    evidenceKeywords: [
      'incident', 'response', 'detection', 'alert', 'escalation', 'SIEM',
      'IR plan', 'incident handling', 'forensics', 'incident report',
      'security incident', 'breach response', 'runbook', 'playbook'
    ],

    implementationTemplate: `## Implementation Status: {status}

### IR Plan:
{ir_plan}

### Detection Capabilities:
{detection}

### Response Team:
{team_structure}

### Evidence Found:
{evidence_list}

### Gaps:
{gaps}

### Recommendations:
{recommendations}

### Overall Completion: {percentage}%`,

    requiredOutputFields: [
      'ir_plan_exists',
      'detection_tools',
      'response_team_defined',
      'escalation_process',
      'incident_tracking'
    ]
  },

  // ========================================
  // IDENTIFICATION & AUTHENTICATION (IA)
  // ========================================
  [ControlFamily.IDENTIFICATION_AUTHENTICATION]: {
    systemMessage: `You are an expert in identity management and authentication systems.
Focus on: user identification, authentication factors, credential management, MFA, biometrics, PKI, and identity federation.`,

    analysisInstructions: `When analyzing identification and authentication:
1. **Identity Management**: Look for user registration, identity verification
2. **Authentication Factors**: Identify password, MFA, biometric, certificate-based
3. **Credential Lifecycle**: Check provisioning, updates, revocation
4. **Password Policy**: Look for complexity, length, expiration rules
5. **MFA Implementation**: Verify multi-factor authentication usage
6. **PKI/Certificates**: Check for certificate-based authentication
7. **Federation**: Look for SAML, OAuth, OpenID Connect
8. **Device Authentication**: Check for device/machine authentication`,

    evidenceKeywords: [
      'identity', 'authentication', 'MFA', '2FA', 'password', 'biometric',
      'SSO', 'SAML', 'OAuth', 'OpenID', 'PKI', 'certificate', 'credential',
      'identity provider', 'IDP', 'federation', 'TOTP', 'FIDO'
    ],

    implementationTemplate: `## Implementation Status: {status}

### Identity Management:
{identity_system}

### Authentication Methods:
{auth_methods}

### MFA Implementation:
{mfa_details}

### Evidence Found:
{evidence_list}

### Gaps:
{gaps}

### Recommendations:
{recommendations}

### Overall Completion: {percentage}%`,

    requiredOutputFields: [
      'identity_system',
      'authentication_factors',
      'mfa_enabled',
      'password_policy',
      'federation_used'
    ]
  },

  // ========================================
  // RISK ASSESSMENT (RA)
  // ========================================
  [ControlFamily.RISK_ASSESSMENT]: {
    systemMessage: `You are an expert in risk assessment and risk management.
Focus on: threat modeling, vulnerability assessment, risk analysis, risk treatment, risk monitoring, and risk register maintenance.`,

    analysisInstructions: `When analyzing risk assessment:
1. **Risk Assessment Process**: Look for documented risk assessment methodology
2. **Threat Modeling**: Check for threat identification, attack vectors
3. **Vulnerability Assessment**: Look for vuln scanning, pentesting
4. **Risk Analysis**: Verify likelihood/impact analysis, risk scoring
5. **Risk Register**: Check for documented risks, treatments, owners
6. **Risk Monitoring**: Look for continuous risk monitoring, KRIs
7. **Risk Treatment**: Check for risk mitigation, acceptance, transfer
8. **Assessment Frequency**: Verify periodic reassessment schedule`,

    evidenceKeywords: [
      'risk assessment', 'threat model', 'vulnerability', 'risk analysis',
      'risk register', 'risk matrix', 'likelihood', 'impact', 'CVSS',
      'penetration test', 'risk mitigation', 'vulnerability scan', 'threat'
    ],

    implementationTemplate: `## Implementation Status: {status}

### Risk Assessment Process:
{process_description}

### Threat Modeling:
{threat_modeling}

### Vulnerability Management:
{vuln_management}

### Evidence Found:
{evidence_list}

### Gaps:
{gaps}

### Recommendations:
{recommendations}

### Overall Completion: {percentage}%`,

    requiredOutputFields: [
      'assessment_methodology',
      'assessment_frequency',
      'risk_register_exists',
      'vuln_scanning',
      'threat_modeling'
    ]
  },

  // ========================================
  // SYSTEM & COMMUNICATIONS PROTECTION (SC)
  // ========================================
  [ControlFamily.SYSTEM_COMMUNICATIONS_PROTECTION]: {
    systemMessage: `You are an expert in network security and communications protection.
Focus on: encryption, network segmentation, boundary protection, secure communications, TLS/SSL, VPN, firewalls, and DDoS protection.`,

    analysisInstructions: `When analyzing system and communications protection:
1. **Encryption**: Look for data-in-transit and at-rest encryption
2. **Network Segmentation**: Check for VLANs, subnets, DMZ, micro-segmentation
3. **Boundary Protection**: Identify firewalls, WAF, IPS/IDS
4. **Secure Protocols**: Verify TLS/SSL, SSH, HTTPS usage
5. **VPN**: Look for remote access VPN, site-to-site VPN
6. **DDoS Protection**: Check for DDoS mitigation services
7. **API Security**: Look for API gateways, rate limiting, authentication
8. **Certificate Management**: Check for cert lifecycle, expiration monitoring`,

    evidenceKeywords: [
      'encryption', 'TLS', 'SSL', 'HTTPS', 'VPN', 'firewall', 'network',
      'segmentation', 'DMZ', 'IPS', 'IDS', 'WAF', 'DDoS', 'IPSec',
      'certificate', 'secure communication', 'boundary', 'perimeter'
    ],

    implementationTemplate: `## Implementation Status: {status}

### Encryption:
{encryption_details}

### Network Segmentation:
{segmentation}

### Boundary Protection:
{boundary_controls}

### Evidence Found:
{evidence_list}

### Gaps:
{gaps}

### Recommendations:
{recommendations}

### Overall Completion: {percentage}%`,

    requiredOutputFields: [
      'encryption_in_transit',
      'encryption_at_rest',
      'network_segmentation',
      'firewall_config',
      'secure_protocols'
    ]
  },

  // ========================================
  // SYSTEM & INFORMATION INTEGRITY (SI)
  // ========================================
  [ControlFamily.SYSTEM_INFORMATION_INTEGRITY]: {
    systemMessage: `You are an expert in system integrity and malware protection.
Focus on: malware protection, intrusion detection, integrity verification, error handling, input validation, and security alerting.`,

    analysisInstructions: `When analyzing system and information integrity:
1. **Malware Protection**: Look for antivirus, EDR, malware scanning
2. **Intrusion Detection**: Check for IDS/IPS, HIDS, network monitoring
3. **Integrity Verification**: Look for file integrity monitoring, checksums
4. **Input Validation**: Check for input sanitization, XSS prevention, SQL injection protection
5. **Error Handling**: Verify secure error messages, no info disclosure
6. **Security Alerts**: Check for alerting on security events
7. **Spam/Phishing Protection**: Look for email filtering, anti-spam
8. **Software Integrity**: Check for code signing, package verification`,

    evidenceKeywords: [
      'antivirus', 'malware', 'IDS', 'IPS', 'EDR', 'integrity', 'FIM',
      'input validation', 'XSS', 'SQL injection', 'security alert',
      'intrusion detection', 'file integrity', 'checksum', 'code signing'
    ],

    implementationTemplate: `## Implementation Status: {status}

### Malware Protection:
{malware_protection}

### Intrusion Detection:
{ids_ips}

### Integrity Verification:
{integrity_controls}

### Evidence Found:
{evidence_list}

### Gaps:
{gaps}

### Recommendations:
{recommendations}

### Overall Completion: {percentage}%`,

    requiredOutputFields: [
      'malware_protection',
      'ids_ips_deployed',
      'integrity_monitoring',
      'input_validation',
      'alert_mechanisms'
    ]
  },

  // ========================================
  // DEFAULT (Generic for unmatched families)
  // ========================================
  DEFAULT: {
    systemMessage: `You are an expert compliance analyst with deep knowledge of security controls and compliance frameworks.`,

    analysisInstructions: `When analyzing this control:
1. Carefully review the control requirements
2. Look for evidence of implementation in the source documents
3. Identify what is implemented and what is missing
4. Provide specific, actionable recommendations
5. Be factual and avoid assumptions`,

    evidenceKeywords: [
      'security', 'control', 'policy', 'procedure', 'documentation',
      'implementation', 'compliance', 'audit', 'review'
    ],

    implementationTemplate: `## Implementation Status: {status}

### Current Implementation:
{current_implementation}

### Evidence Found:
{evidence_list}

### Gaps:
{gaps}

### Recommendations:
{recommendations}

### Overall Completion: {percentage}%`,

    requiredOutputFields: [
      'implementation_description',
      'evidence_list',
      'gaps',
      'recommendations'
    ]
  }
};

/**
 * Get appropriate prompt configuration for a control
 */
export function getPromptForControl(controlName: string): ControlFamilyPrompt {
  // Extract family code (e.g., "AC" from "AC-2")
  const familyCode = controlName.substring(0, 2).toUpperCase();

  return CONTROL_FAMILY_PROMPTS[familyCode] || CONTROL_FAMILY_PROMPTS.DEFAULT;
}

/**
 * Get all supported control families
 */
export function getSupportedFamilies(): string[] {
  return Object.keys(CONTROL_FAMILY_PROMPTS).filter(k => k !== 'DEFAULT');
}
