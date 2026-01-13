import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertAccessControlPolicyTemplate1750936000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Control Policy - NIST 800-53 Compliant</title>
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
    <h1>Access Control Policy</h1>
    <div class="section">
        <h2>Document Information</h2>
        <table>
            <tr>
                <td><strong>Document Title:</strong></td>
                <td>Access Control Policy</td>
            </tr>
            <tr>
                <td><strong>Document ID:</strong></td>
                <td>POL-SEC-AC-001</td>
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
        <p>This Access Control Policy establishes the requirements for implementing and maintaining access controls within [Organization Name]. This policy aligns with the access control requirements specified in the National Institute of Standards and Technology (NIST) Special Publication 800-53 Revision 5.</p>
        
        <h3>1.1 Purpose</h3>
        <p>The purpose of this policy is to:</p>
        <ul>
            <li>Establish requirements for managing access to organizational information systems</li>
            <li>Ensure appropriate access controls are implemented across all information systems</li>
            <li>Protect organizational information and information systems from unauthorized access</li>
            <li>Support compliance with applicable laws, regulations, and standards</li>
        </ul>
        
        <h3>1.2 Scope</h3>
        <p>This policy applies to:</p>
        <ul>
            <li>All information systems owned, operated, or managed by [Organization Name]</li>
            <li>All employees, contractors, consultants, temporary workers, and other personnel who use or administer organizational information systems</li>
            <li>Third-party vendors and service providers that store, process, or transmit organizational data</li>
            <li>All facilities where organizational information systems are housed</li>
        </ul>
    </div>

    <div class="section">
        <h2>2. Policy Statements</h2>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-1: Access Control Policy and Procedures</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Develop, document, and disseminate an access control policy that addresses purpose, scope, roles, responsibilities, management commitment, coordination among organizational entities, and compliance</li>
                <li>Designate the CISO as responsible for reviewing and updating the access control policy at least annually</li>
                <li>Develop, document, and disseminate procedures to facilitate policy implementation</li>
                <li>Review and update access control procedures at least annually</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-2: Account Management</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Identify and select the following types of information system accounts to support organizational missions/business functions:
                    <ul>
                        <li>Individual user accounts</li>
                        <li>Shared/group accounts</li>
                        <li>System accounts</li>
                        <li>Guest/anonymous accounts</li>
                    </ul>
                </li>
                <li>Establish conditions for group and role membership</li>
                <li>Specify authorized users of the information system, group and role membership, and access authorizations</li>
                <li>Require approvals by designated organizational officials for requests to create information system accounts</li>
                <li>Create, enable, modify, disable, and remove accounts in accordance with organizational policy</li>
                <li>Monitor the use of information system accounts</li>
                <li>Notify account managers when temporary accounts are no longer required and when information system users are terminated or transferred</li>
                <li>Deactivate temporary or emergency accounts after a defined time period</li>
                <li>Monitor and audit account creation, modification, disabling, and removal actions</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-3: Enforcement of Flow Enforcement</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Enforce approved authorizations for controlling the flow of information within the system and between interconnected systems</li>
                <li>Implement flow enforcement mechanisms to control the flow of information between different security domains</li>
                <li>Monitor and audit flow enforcement mechanisms</li>
                <li>Document flow enforcement policies and procedures</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-4: Information Flow Enforcement</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Enforce approved authorizations for controlling the flow of information within the system and between interconnected systems</li>
                <li>Implement flow enforcement mechanisms to control the flow of information between different security domains</li>
                <li>Monitor and audit flow enforcement mechanisms</li>
                <li>Document flow enforcement policies and procedures</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-5: Separation of Duties</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Separate duties of individuals as necessary to prevent malevolent activity without collusion</li>
                <li>Document separation of duties requirements</li>
                <li>Implement mechanisms to enforce separation of duties</li>
                <li>Review and update separation of duties assignments at least annually</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-6: Least Privilege</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Employ the principle of least privilege, allowing only authorized accesses for users (or processes acting on behalf of users) which are necessary to accomplish assigned tasks</li>
                <li>Review and update user privileges at least annually</li>
                <li>Implement mechanisms to enforce least privilege</li>
                <li>Document least privilege requirements and exceptions</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-7: Unsuccessful Logon Attempts</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Enforce a limit of consecutive invalid logon attempts by a user during a time period</li>
                <li>Automatically lock the account or node for a defined time period</li>
                <li>Delay the next logon prompt according to defined time period</li>
                <li>Notify the system administrator when the threshold is exceeded</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-8: System Use Notification</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Display an approved system use notification message or banner before granting access to the system</li>
                <li>Retain the notification message or banner on the screen until users acknowledge the usage conditions</li>
                <li>Display the notification message or banner for web-based sessions when the system is accessed</li>
                <li>Include in the notification message or banner:
                    <ul>
                        <li>Appropriate use of the system</li>
                        <li>Security and privacy requirements</li>
                        <li>Legal consequences of unauthorized use</li>
                        <li>Monitoring and recording of system use</li>
                    </ul>
                </li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-9: Previous Logon (Access) Notification</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Notify the user, upon successful logon (access) to the system, of the date and time of the last logon (access)</li>
                <li>Notify the user, upon successful logon (access) to the system, of the number of unsuccessful logon attempts since the last successful logon</li>
                <li>Notify the user, upon successful logon (access) to the system, of the location of the last successful logon (access)</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-10: Concurrent Session Control</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Limit the number of concurrent sessions for each system account to an organization-defined number</li>
                <li>Implement mechanisms to enforce concurrent session limits</li>
                <li>Monitor and audit concurrent session usage</li>
                <li>Document concurrent session control requirements</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-11: Session Lock</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Prevent further access to the system by initiating a session lock after a defined time period of inactivity</li>
                <li>Retain the session lock until the user reestablishes access using appropriate identification and authentication procedures</li>
                <li>Display an organization-defined message when the system is locked</li>
                <li>Implement mechanisms to enforce session lock</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-12: Session Termination</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Automatically terminate a user session after a defined time period of inactivity</li>
                <li>Provide the capability for users to manually terminate their sessions</li>
                <li>Implement mechanisms to enforce session termination</li>
                <li>Document session termination requirements</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-13: Supervision and Review - Access Control</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Supervise and review the activities of users with respect to the enforcement and usage of access control mechanisms</li>
                <li>Monitor and audit access control activities</li>
                <li>Review access control logs at least weekly</li>
                <li>Take appropriate action if unauthorized access is detected</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-14: Permitted Actions without Identification or Authentication</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Identify specific user actions that can be performed on the information system without identification or authentication</li>
                <li>Document and justify the actions that can be performed without identification or authentication</li>
                <li>Monitor and audit actions performed without identification or authentication</li>
                <li>Review and update the list of permitted actions at least annually</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-15: Automated Marking</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Mark output using standard naming conventions to identify the information system, name, and/or designation</li>
                <li>Implement mechanisms to enforce automated marking</li>
                <li>Review and update marking requirements at least annually</li>
                <li>Document marking requirements and procedures</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-16: Security Attributes</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Associate security attributes with information in storage, in process, and/or in transmission</li>
                <li>Implement mechanisms to enforce security attributes</li>
                <li>Review and update security attributes at least annually</li>
                <li>Document security attribute requirements and procedures</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-17: Remote Access</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Establish and document usage restrictions, configuration/connection requirements, and monitoring for remote access to the information system</li>
                <li>Authorize remote access to the information system</li>
                <li>Monitor and control remote access methods</li>
                <li>Enforce requirements for remote connections to the information system</li>
                <li>Employ automated mechanisms to facilitate the monitoring and control of remote access methods</li>
                <li>Implement cryptography mechanisms to protect the confidentiality and integrity of remote access sessions</li>
                <li>Route remote access through managed access control points</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-18: Wireless Access</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Establish usage restrictions, configuration/connection requirements, and monitoring for wireless access to the information system</li>
                <li>Authorize wireless access to the information system</li>
                <li>Monitor and control wireless access methods</li>
                <li>Enforce requirements for wireless connections to the information system</li>
                <li>Employ automated mechanisms to facilitate the monitoring and control of wireless access methods</li>
                <li>Implement cryptography mechanisms to protect the confidentiality and integrity of wireless access sessions</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-19: Access Control for Mobile Devices</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Establish usage restrictions, configuration requirements, connection requirements, and monitoring for mobile devices</li>
                <li>Authorize the connection of mobile devices to organizational information systems</li>
                <li>Monitor and control mobile device connections</li>
                <li>Enforce requirements for mobile device connections</li>
                <li>Employ automated mechanisms to facilitate the monitoring and control of mobile device connections</li>
                <li>Implement cryptography mechanisms to protect the confidentiality and integrity of mobile device connections</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-20: Use of External Information Systems</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Establish terms and conditions, consistent with any trust relationships established with other organizations owning, operating, and/or maintaining external information systems, allowing authorized individuals to:
                    <ul>
                        <li>Access the information system from external information systems</li>
                        <li>Process, store, or transmit organization-controlled information using external information systems</li>
                    </ul>
                </li>
                <li>Document terms and conditions for use of external information systems</li>
                <li>Monitor and control use of external information systems</li>
                <li>Employ automated mechanisms to facilitate the monitoring and control of use of external information systems</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-21: Information Sharing</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Facilitate information sharing by enabling authorized users to determine whether access authorizations assigned to the sharing partner match the access restrictions on the information for an authorized information flow</li>
                <li>Employ automated mechanisms to assist users in making information sharing decisions</li>
                <li>Review and update information sharing policies and procedures at least annually</li>
                <li>Document information sharing requirements and procedures</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-22: Publicly Accessible Content</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Designate individuals authorized to post information onto a publicly accessible information system</li>
                <li>Train authorized individuals to ensure that publicly accessible information does not contain nonpublic information</li>
                <li>Review the content on the publicly accessible information system for nonpublic information at least monthly</li>
                <li>Remove or designate as nonpublic any information posted on a publicly accessible information system that should not be publicly available</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-23: Data Mining Protection</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Employ automated mechanisms to detect the presence of unauthorized hardware, software, and firmware components within the information system</li>
                <li>Take appropriate action when unauthorized components are detected</li>
                <li>Document data mining protection requirements and procedures</li>
                <li>Review and update data mining protection requirements at least annually</li>
            </ol>
        </div>
        
        <div class="policy-control">
            <h3><span class="policy-id">AC-24: Access Control Decisions</span></h3>
            <p>The organization shall:</p>
            <ol>
                <li>Establish procedures to ensure that access control decisions are applied to each access request prior to access execution</li>
                <li>Employ automated mechanisms to enforce access control decisions</li>
                <li>Review and update access control decision procedures at least annually</li>
                <li>Document access control decision requirements and procedures</li>
            </ol>
        </div>
    </div>

    <div class="section">
        <h2>3. Roles and Responsibilities</h2>
        <p>The following roles and responsibilities are established for implementing and maintaining this policy:</p>
        <ul>
            <li><strong>Chief Information Security Officer (CISO):</strong> Responsible for overall policy implementation and maintenance</li>
            <li><strong>System Administrators:</strong> Responsible for implementing access controls and monitoring system access</li>
            <li><strong>Information System Owners:</strong> Responsible for ensuring access controls are implemented for their systems</li>
            <li><strong>Users:</strong> Responsible for following access control procedures and reporting security incidents</li>
        </ul>
    </div>

    <div class="section">
        <h2>4. Enforcement</h2>
        <p>Violations of this policy may result in disciplinary action, up to and including termination of employment, and/or legal action. The organization will investigate all reported violations and take appropriate action based on the severity of the violation.</p>
    </div>

    <div class="section">
        <h2>5. Exceptions</h2>
        <p>Exceptions to this policy must be approved in writing by the CISO and documented. All exceptions must be reviewed annually and either renewed or terminated.</p>
    </div>

    <div class="section">
        <h2>6. Review and Updates</h2>
        <p>This policy shall be reviewed and updated at least annually or as significant changes occur that affect the implementation of access controls.</p>
    </div>

    <div class="section">
        <h2>7. Related Documents</h2>
        <ul>
            <li>NIST Special Publication 800-53 Revision 5</li>
            <li>Organization's Information Security Policy</li>
            <li>Organization's Password Policy</li>
            <li>Organization's Remote Access Policy</li>
        </ul>
    </div>

    <div class="section">
        <h2>8. Definitions</h2>
        <ul>
            <li><strong>Access Control:</strong> The process of granting or denying specific requests to obtain and use information and related information processing services</li>
            <li><strong>Authentication:</strong> Verifying the identity of a user, process, or device</li>
            <li><strong>Authorization:</strong> The right or a permission that is granted to a system entity to access a system resource</li>
            <li><strong>Least Privilege:</strong> The principle that users should be given the minimum level of access necessary to perform their job functions</li>
            <li><strong>Remote Access:</strong> Access to an organizational information system by a user (or an information system) communicating through an external, non-organization-controlled network</li>
        </ul>
    </div>

    <div class="approval">
        <h2>9. Approval and Adoption</h2>
        <p>This policy has been reviewed and approved by the following individuals:</p>
        <div>
            <div class="signature-line"></div>
            <p>Chief Information Security Officer</p>
        </div>
        <div>
            <div class="signature-line"></div>
            <p>Chief Executive Officer</p>
        </div>
    </div>

    <div class="footer">
        <p>© 2025 Organization Name. All rights reserved.</p>
        <p>This document is classified as CONFIDENTIAL and should not be shared outside the organization without proper authorization.</p>
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
            `, ['Access Control Policy', JSON.stringify(contentJson)]);
        } catch (error) {
            console.error('Error in migration:', error);
            throw error;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`
                DELETE FROM policy_template
                WHERE name = 'Access Control Policy'
            `);
        } catch (error) {
            console.error('Error in migration rollback:', error);
            throw error;
        }
    }
} 