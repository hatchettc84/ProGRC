import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertRiskAssessmentPolicyTemplate1750936000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Risk Assessment Policy - NIST 800-53 Compliant</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            color: #2c3e50;
            border-bottom: 1px solid #bdc3c7;
            padding-bottom: 5px;
            margin-top: 30px;
        }
        h3 {
            color: #34495e;
            margin-top: 25px;
        }
        .section {
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .policy-control {
            border-left: 4px solid #3498db;
            padding-left: 15px;
            margin: 15px 0;
            background-color: #ecf0f1;
            padding: 10px;
            border-radius: 0 5px 5px 0;
        }
        .policy-id {
            font-weight: bold;
            color: #2980b9;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 10px;
            border: 1px solid #ddd;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #bdc3c7;
            text-align: center;
            font-size: 0.9em;
            color: #7f8c8d;
        }
        .approval {
            margin-top: 40px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 50px;
            padding-top: 10px;
            width: 300px;
        }
    </style>
</head>
<body>
    <h1>Risk Assessment Policy</h1>
    <div class="section">
        <h2>Document Information</h2>
        <table>
            <tr>
                <td><strong>Document Title:</strong></td>
                <td>Risk Assessment Policy</td>
            </tr>
            <tr>
                <td><strong>Document ID:</strong></td>
                <td>POL-SEC-RA-001</td>
            </tr>
            <tr>
                <td><strong>Version:</strong></td>
                <td>1.0</td>
            </tr>
            <tr>
                <td><strong>Effective Date:</strong></td>
                <td>March 25, 2025</td>
            </tr>
            <tr>
                <td><strong>Review Frequency:</strong></td>
                <td>Annual</td>
            </tr>
            <tr>
                <td><strong>Classification:</strong></td>
                <td>Confidential</td>
            </tr>
            <tr>
                <td><strong>Document Owner:</strong></td>
                <td>Chief Information Security Officer (CISO)</td>
            </tr>
        </table>
    </div>

    <div class="section">
        <h2>1. Purpose and Scope</h2>
        <p>This Risk Assessment Policy establishes the requirements for assessing security risks to information systems and information processing facilities within [Organization Name]. This policy aligns with the risk assessment requirements specified in the National Institute of Standards and Technology (NIST) Special Publication 800-53 Revision 5.</p>
        
        <h3>1.1 Purpose</h3>
        <p>The purpose of this policy is to:</p>
        <ul>
            <li>Establish a standardized approach to risk assessment within the organization</li>
            <li>Define roles and responsibilities for conducting risk assessments</li>
            <li>Ensure compliance with applicable laws, regulations, and standards</li>
            <li>Provide a foundation for risk-based decision making</li>
            <li>Support the organization's overall risk management strategy</li>
            <li>Identify, analyze, and prioritize information security risks</li>
        </ul>
        
        <h3>1.2 Scope</h3>
        <p>This policy applies to:</p>
        <ul>
            <li>All information systems owned, operated, or managed by [Organization Name]</li>
            <li>All employees, contractors, consultants, temporary workers, and other personnel</li>
            <li>Third-party vendors and service providers that store, process, or transmit organizational data</li>
            <li>All facilities where organizational information systems are housed</li>
            <li>All business processes and functions that rely on information systems</li>
            <li>All information assets regardless of form or location</li>
        </ul>
    </div>

    <div class="section">
        <h2>2. Policy Statements</h2>
        
        <div class="policy-control">
            <h3><span class="policy-id">RA-1: Risk Assessment Policy and Procedures</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Develop, document, and disseminate a risk assessment policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance</li>
                <li>Designate the CISO as responsible for reviewing and updating the risk assessment policy at least annually</li>
                <li>Develop, document, and disseminate procedures to facilitate policy implementation</li>
                <li>Review and update risk assessment procedures at least annually</li>
                <li>Ensure risk assessment policy and procedures align with the organization's overall risk management strategy</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">RA-2: Security Categorization</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Categorize information and information systems in accordance with applicable federal laws, executive orders, directives, policies, regulations, standards, and guidance</li>
                <li>Document the security categorization results (including supporting rationale) in the security plan for the information system</li>
                <li>Ensure that the authorizing official or authorizing official designated representative reviews and approves the security categorization decision</li>
                <li>Use FIPS 199 impact levels (Low, Moderate, High) for categorizing information systems based on the potential impact of a security breach on the confidentiality, integrity, and availability of information</li>
                <li>Review and update the security categorization at least annually or whenever there are significant changes to the information system, organization, or environment of operation</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">RA-3: Risk Assessment</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Conduct a risk assessment for all information systems that includes:
                    <ul>
                        <li>Identification of threats to and vulnerabilities in the information system</li>
                        <li>Assessment of the likelihood and magnitude of harm from unauthorized access, use, disclosure, disruption, modification, or destruction of the information system, information, or operations</li>
                        <li>Determination of risk based on the assessment of the likelihood and the magnitude of harm</li>
                    </ul>
                </li>
                <li>Document risk assessment results in a risk assessment report</li>
                <li>Review risk assessment results at least annually</li>
                <li>Update the risk assessment at least annually, when there are significant changes to the information system or environment of operation, or when there are new threats or vulnerabilities</li>
                <li>Communicate risk assessment results to appropriate organizational officials</li>
                <li>Use risk assessment results to inform security control selection, implementation, and assessment</li>
                <li>Integrate risk assessment into the system development life cycle (SDLC)</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">RA-4: Risk Assessment Update (withdrawn)</span></h3>
            <p>This control has been withdrawn and incorporated into RA-3.</p>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">RA-5: Vulnerability Monitoring and Scanning</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Monitor and scan for vulnerabilities in the information system and hosted applications at least monthly and when new vulnerabilities potentially affecting the system are identified and reported</li>
                <li>Employ vulnerability scanning tools and techniques that facilitate interoperability among tools and automate parts of the vulnerability management process by using standards for:
                    <ul>
                        <li>Enumerating platforms, software flaws, and improper configurations</li>
                        <li>Formatting checklists and test procedures</li>
                        <li>Measuring vulnerability impact</li>
                    </ul>
                </li>
                <li>Analyze vulnerability scan reports and results from security control assessments</li>
                <li>Remediate legitimate vulnerabilities in accordance with the following timeframes:
                    <ul>
                        <li>Critical vulnerabilities: within 15 days</li>
                        <li>High vulnerabilities: within 30 days</li>
                        <li>Moderate vulnerabilities: within 90 days</li>
                        <li>Low vulnerabilities: within 180 days</li>
                    </ul>
                </li>
                <li>Share information obtained from the vulnerability scanning process and security control assessments with designated personnel to help eliminate similar vulnerabilities in other information systems</li>
                <li>Employ vulnerability scanning tools that include the capability to readily update the information system vulnerabilities to be scanned</li>
                <li>Perform authenticated scans of the information system with privileged access at least quarterly</li>
                <li>Perform vulnerability scanning in a manner that minimizes the risk of operational impact to production systems</li>
                <li>Implement privileged access authorization to information systems, network devices, and applications for vulnerability scanning activities</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">RA-6: Technical Surveillance Countermeasures Survey</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Employ a technical surveillance countermeasures survey at facilities/areas where classified or sensitive information is discussed or stored when:
                    <ul>
                        <li>New facilities/areas are being planned or constructed</li>
                        <li>Significant renovations or modifications are made to facilities/areas</li>
                        <li>Equipment or furnishings are introduced to facilities/areas</li>
                        <li>Signs of potential surveillance or intrusion attempts are detected</li>
                        <li>At a frequency defined in risk management policies (at least every 3 years)</li>
                    </ul>
                </li>
                <li>Contract with qualified personnel or organizations to conduct technical surveillance countermeasures surveys</li>
                <li>Document the results of technical surveillance countermeasures surveys</li>
                <li>Develop remediation plans for identified technical surveillance risks</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">RA-7: Risk Response</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Respond to findings from security and privacy risk assessments by:
                    <ul>
                        <li>Accepting the risk as within the organizational risk tolerance</li>
                        <li>Mitigating the risk by implementing security controls</li>
                        <li>Sharing or transferring the risk using contracts, agreements, or insurance</li>
                        <li>Avoiding the risk by eliminating the activity or process creating the risk</li>
                    </ul>
                </li>
                <li>Document risk responses and ensure they are approved by the appropriate level of management</li>
                <li>Monitor the implementation and effectiveness of risk responses</li>
                <li>Periodically reassess risk responses to ensure they remain appropriate and effective</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">RA-8: Privacy Impact Assessments</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Conduct privacy impact assessments for information systems, programs, or other activities that process personally identifiable information (PII) before:
                    <ul>
                        <li>Developing or procuring information technology that processes PII</li>
                        <li>Initiating a new collection of PII</li>
                        <li>Significantly modifying a program, system, or process that processes PII</li>
                    </ul>
                </li>
                <li>Publish privacy impact assessment results on publicly accessible websites, as required by law or organizational policy</li>
                <li>Update privacy impact assessments whenever changes create new privacy risks</li>
                <li>Ensure privacy impact assessments address:
                    <ul>
                        <li>What information is being collected</li>
                        <li>Why the information is being collected</li>
                        <li>The intended use of the information</li>
                        <li>With whom the information will be shared</li>
                        <li>What opportunities individuals have to decline to provide information</li>
                        <li>How the information will be secured</li>
                        <li>Whether a system of records is being created under the Privacy Act</li>
                        <li>What choices individuals have about how their data is used</li>
                    </ul>
                </li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">RA-9: Criticality Analysis</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Identify critical system components and functions by performing a criticality analysis for information systems, system components, or system services at all phases of the system development life cycle</li>
                <li>The criticality analysis shall identify:
                    <ul>
                        <li>Mission-essential functions and critical components</li>
                        <li>Critical failure components or points</li>
                        <li>Critical dependencies and interdependencies</li>
                        <li>Components that require increased levels of protection</li>
                        <li>Components that require specialized protective controls</li>
                    </ul>
                </li>
                <li>Use the results of the criticality analysis to inform system design, development, implementation, and operational decisions</li>
                <li>Update the criticality analysis when there are significant changes to the information system, environment of operation, or mission/business processes</li>
                <li>Document the criticality analysis results and incorporate them into risk assessment documentation</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">RA-10: Threat Hunting</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Establish and maintain a threat hunting capability to:
                    <ul>
                        <li>Search for indicators of compromise in organizational systems</li>
                        <li>Detect, track, and disrupt threats that evade existing controls</li>
                    </ul>
                </li>
                <li>Employ the threat hunting capability at least quarterly</li>
                <li>Establish procedures for threat hunting that describe:
                    <ul>
                        <li>The resources to be used (tools, data sources, etc.)</li>
                        <li>Approach for analyzing information to look for indicators of compromise</li>
                        <li>Methods and frequency of conducting threat hunting</li>
                        <li>Process for incorporating threat intelligence information</li>
                        <li>How findings are to be documented and shared</li>
                    </ul>
                </li>
                <li>Use the results from threat hunting activities to inform risk management processes and security operations</li>
                <li>Share threat hunting results with appropriate organizational stakeholders</li>
            </ol>
        </div>
    </div>

    <div class="section">
        <h2>3. Risk Assessment Methodology</h2>
        
        <h3>3.1 General Approach</h3>
        <p>The organization shall implement a structured risk assessment methodology that includes the following phases:</p>
        <ol>
            <li><strong>System Characterization:</strong> Define the scope of the assessment, system boundaries, information classification, and system components.</li>
            <li><strong>Threat Identification:</strong> Identify potential threat sources and threat events relevant to the system and its environment.</li>
            <li><strong>Vulnerability Identification:</strong> Identify vulnerabilities in system components, security controls, and processes.</li>
            <li><strong>Control Analysis:</strong> Analyze existing and planned security controls to determine their effectiveness.</li>
            <li><strong>Likelihood Determination:</strong> Assess the likelihood that threat sources will exploit vulnerabilities.</li>
            <li><strong>Impact Analysis:</strong> Determine the adverse impacts to organizational operations, assets, individuals, or other organizations resulting from successful threat exploitation.</li>
            <li><strong>Risk Determination:</strong> Combine likelihood and impact assessments to determine risk level.</li>
            <li><strong>Control Recommendations:</strong> Identify additional controls to mitigate identified risks.</li>
            <li><strong>Results Documentation:</strong> Document the assessment process and results in a formal risk assessment report.</li>
        </ol>
        
        <h3>3.2 Risk Calculation</h3>
        <p>Risk levels shall be calculated using the following approach:</p>
        <ul>
            <li><strong>Likelihood:</strong> Rate as High (3), Medium (2), or Low (1) based on threat capability, motivation, and control effectiveness</li>
            <li><strong>Impact:</strong> Rate as High (3), Medium (2), or Low (1) based on potential harm to confidentiality, integrity, and availability</li>
            <li><strong>Risk Score:</strong> Calculated as Likelihood × Impact (1-9)</li>
            <li><strong>Risk Level:</strong>
                <ul>
                    <li>High Risk: 7-9 points</li>
                    <li>Medium Risk: 4-6 points</li>
                    <li>Low Risk: 1-3 points</li>
                </ul>
            </li>
        </ul>
        
        <h3>3.3 Risk Assessment Types</h3>
        <p>The organization shall employ the following types of risk assessments as appropriate:</p>
        <ul>
            <li><strong>Baseline Risk Assessments:</strong> Comprehensive assessment conducted when a system is first developed or significantly modified</li>
            <li><strong>Operational Risk Assessments:</strong> Regular assessments of systems in production environment</li>
            <li><strong>Targeted Risk Assessments:</strong> Focused assessments of specific system components, vulnerabilities, or threats</li>
            <li><strong>Third-Party Risk Assessments:</strong> Assessments of risks associated with vendors, service providers, and partners</li>
            <li><strong>Application Security Risk Assessments:</strong> Focused on application-level security risks</li>
            <li><strong>Enterprise Risk Assessments:</strong> Organization-wide assessments of information security risks</li>
        </ul>
    </div>

    <div class="section">
        <h2>4. Roles and Responsibilities</h2>
        
        <h3>4.1 Chief Information Security Officer (CISO)</h3>
        <ul>
            <li>Owns and maintains this policy</li>
            <li>Ensures alignment with regulatory requirements and industry standards</li>
            <li>Reviews and approves exceptions to this policy</li>
            <li>Oversees the risk assessment program</li>
            <li>Reviews and approves risk assessment results and recommended risk responses</li>
            <li>Reports significant risks to executive management</li>
        </ul>
        
        <h3>4.2 Risk Management Team</h3>
        <ul>
            <li>Develops and maintains risk assessment procedures and methodologies</li>
            <li>Coordinates and facilitates risk assessment activities</li>
            <li>Provides training and guidance on risk assessment processes</li>
            <li>Validates risk assessment results</li>
            <li>Maintains risk assessment documentation</li>
            <li>Monitors the implementation of risk responses</li>
        </ul>
        
        <h3>4.3 System Owners</h3>
        <ul>
            <li>Ensure risk assessments are conducted for their systems</li>
            <li>Provide necessary information for risk assessments</li>
            <li>Review and approve risk assessment results for their systems</li>
            <li>Implement recommended security controls and risk responses</li>
            <li>Report changes to systems that may require risk reassessments</li>
        </ul>
        
        <h3>4.4 Security Assessment Team</h3>
        <ul>
            <li>Conducts vulnerability scans and technical assessments</li>
            <li>Performs security testing and penetration testing</li>
            <li>Analyzes security control effectiveness</li>
            <li>Documents and reports technical findings</li>
            <li>Provides technical expertise for risk assessment activities</li>
        </ul>
        
        <h3>4.5 Privacy Officer</h3>
        <ul>
            <li>Leads privacy impact assessments</li>
            <li>Ensures privacy risks are properly identified and addressed</li>
            <li>Reviews risk assessments involving personally identifiable information</li>
            <li>Ensures compliance with privacy laws and regulations</li>
        </ul>
        
        <h3>4.6 Business Process Owners</h3>
        <ul>
            <li>Participate in risk assessments affecting their business processes</li>
            <li>Provide input on business impact of potential security incidents</li>
            <li>Help identify critical business functions and assets</li>
            <li>Contribute to the development of risk responses</li>
        </ul>
    </div>

    <div class="section">
        <h2>5. Risk Assessment Reporting</h2>
        <p>Risk assessment reports shall include, at minimum, the following elements:</p>
        <ol>
            <li><strong>Executive Summary:</strong> High-level overview of key findings and recommendations</li>
            <li><strong>Assessment Scope:</strong> Systems, components, and boundaries included in the assessment</li>
            <li><strong>Methodology:</strong> Description of the approach and techniques used</li>
            <li><strong>System Description:</strong> Overview of the system architecture and components</li>
            <li><strong>Identified Risks:</strong> Detailed description of each risk, including:
                <ul>
                    <li>Risk ID and name</li>
                    <li>Related threats and vulnerabilities</li>
                    <li>Affected assets or components</li>
                    <li>Likelihood and impact ratings</li>
                    <li>Overall risk level</li>
                    <li>Existing controls</li>
                </ul>
            </li>
            <li><strong>Risk Response Recommendations:</strong> Proposed approaches for addressing identified risks</li>
            <li><strong>Implementation Plan:</strong> Prioritized action plan with timelines and responsibilities</li>
            <li><strong>Appendices:</strong> Supporting documentation, such as scan results, test outputs, and interview notes</li>
        </ol>
        <p>Risk assessment reports shall be distributed to the following personnel:</p>
        <ul>
            <li>Chief Information Security Officer</li>
            <li>System Owner</li>
            <li>Business Process Owner</li>
            <li>IT Security Team</li>
            <li>Authorizing Official (for systems requiring authorization)</li>
            <li>Other stakeholders as determined by the CISO</li>
        </ul>
    </div>

    <div class="section">
        <h2>6. Enforcement</h2>
        <p>Violations of this policy may result in disciplinary action, up to and including termination of employment or contract. The severity of disciplinary action will be determined by the nature and context of the violation.</p>
        <p>Failure to conduct required risk assessments may result in:</p>
        <ul>
            <li>Denial of system authorization to operate</li>
            <li>Restriction of system connectivity</li>
            <li>Withholding of resources for system development or enhancement</li>
            <li>Escalation to executive management</li>
        </ul>
    </div>

    <div class="section">
        <h2>7. Exceptions</h2>
        <p>Exceptions to this policy must be:</p>
        <ul>
            <li>Documented using the Security Exception Request Form</li>
            <li>Approved by the Chief Information Security Officer (CISO)</li>
            <li>Reviewed and re-approved at least quarterly</li>
            <li>Documented with compensating controls to mitigate risks</li>
            <li>Limited in duration to the minimum time necessary</li>
        </ul>
        <p>Temporary exceptions may be granted in emergency situations but must be reviewed and formally approved or rejected within 48 hours.</p>
    </div>

    <div class="section">
        <h2>8. Review and Updates</h2>
        <p>This policy shall be reviewed at least annually to ensure continued effectiveness and compliance with regulations and standards. The review process will include:</p>
        <ul>
            <li>Assessment of policy effectiveness</li>
            <li>Evaluation of compliance with relevant regulations and standards</li>
            <li>Identification of needed updates based on changes to the organization's environment, technologies, or requirements</li>
            <li>Documentation of review results and approved changes</li>
            <li>Updates to risk assessment methodologies based on industry developments and organizational lessons learned</li>
        </ul>
    </div>

    <div class="section">
        <h2>9. Related Documents</h2>
        <ul>
            <li>Information Security Policy</li>
            <li>Risk Management Policy</li>
            <li>System Security Planning Policy</li>
            <li>Security Assessment and Authorization Policy</li>
            <li>Vulnerability Management Procedure</li>
            <li>Risk Assessment Procedure</li>
            <li>Privacy Impact Assessment Procedure</li>
            <li>Security Control Assessment Procedure</li>
            <li>Security Exception Request Form</li>
        </ul>
    </div>

    <div class="section">
        <h2>10. Definitions</h2>
        <table>
            <tr>
                <th>Term</th>
                <th>Definition</th>
            </tr>
            <tr>
                <td>Risk</td>
                <td>The potential for an unwanted outcome resulting from an incident, event, or occurrence, as determined by its likelihood and the associated consequences.</td>
            </tr>
            <tr>
                <td>Risk Assessment</td>
                <td>The process of identifying, estimating, and prioritizing risks to organizational operations, organizational assets, individuals, other organizations, and the Nation, resulting from the operation of an information system.</td>
            </tr>
            <tr>
                <td>Threat</td>
                <td>Any circumstance or event with the potential to adversely impact organizational operations, organizational assets, individuals, other organizations, or the Nation through an information system via unauthorized access, destruction, disclosure, modification of information, and/or denial of service.</td>
            </tr>
            <tr>
                <td>Vulnerability</td>
                <td>A weakness in an information system, system security procedures, internal controls, or implementation that could be exploited by a threat source.</td>
            </tr>
            <tr>
                <td>Impact</td>
                <td>The magnitude of harm that could be caused by a threat's exploitation of a vulnerability.</td>
            </tr>
            <tr>
                <td>Likelihood</td>
                <td>A weighted factor based on a subjective analysis of the probability that a given threat is capable of exploiting a given vulnerability or set of vulnerabilities.</td>
            </tr>
            <tr>
                <td>Security Control</td>
                <td>The safeguards or countermeasures prescribed for an information system or an organization to protect the confidentiality, integrity, and availability of the system and its information.</td>
            </tr>
            <tr>
                <td>Risk Response</td>
                <td>The approach for addressing risk, which can include accepting, avoiding, mitigating, sharing, or transferring risk.</td>
            </tr>
            <tr>
                <td>Privacy Impact Assessment</td>
                <td>An analysis of how personally identifiable information is collected, used, shared, and maintained to ensure compliance with privacy requirements and to identify and mitigate privacy risks.</td>
            </tr>
            <tr>
                <td>Criticality Analysis</td>
                <td>The process of identifying the critical functions, components, and dependencies of an information system to facilitate prioritization of security controls and contingency planning.</td>
            </tr>
        </table>
    </div>

    <div class="approval">
        <h2>11. Approval and Adoption</h2>
        <p>This policy is approved and adopted as of the Effective Date listed above.</p>
        
        <div class="signature-line">
            Chief Information Security Officer
        </div>
        
        <div class="signature-line">
            Chief Information Officer
        </div>
        
        <div class="signature-line">
            Chief Executive Officer
        </div>
    </div>

    <div class="footer">
        <p>&copy; 2025 [Organization Name]. All rights reserved.</p>
        <p>This document is confidential and proprietary to [Organization Name].</p>
        <p>Document ID: POL-SEC-RA-001 | Version 1.0</p>
    </div>
</body>
</html>`;

            // Create a JSONB object for the content
            const contentJson = {
                htmlContent: htmlContent
            };

            await queryRunner.query(`
                INSERT INTO policy_template (name, content, created_at, updated_at)
                VALUES ($1, $2::jsonb, NOW(), NOW())
            `, ['Risk Assessment Policy', JSON.stringify(contentJson)]);
        } catch (error) {
            console.error('Error in migration:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`
                DELETE FROM policy_template
                WHERE name = 'Risk Assessment Policy'
            `);
        } catch (error) {
            console.error('Error in migration rollback:', error);
            throw error;
        }
    }
} 