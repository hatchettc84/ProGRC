import { MigrationInterface, QueryRunner } from "typeorm";

export class AddControlForMaintenance1729774236875 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Maintenance';

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MA-1 Policy And Procedures',
                'Review and update the current maintenance:',
                'low,moderate,high',
                'Maintenance policy and procedures address the controls in the MA family that are implemented within systems and organizations. The risk management strategy is an important factor in establishing such policies and procedures. Policies and procedures contribute to security and privacy assurance. Therefore, it is important that security and privacy programs collaborate on the development of maintenance policy and procedures. Security and privacy program policies and procedures at the organization level are preferable, in general, and may obviate the need for mission- or system-specific policies and procedures. The policy can be included as part of the general security and privacy policy or be represented by multiple policies that reflect the complex nature of organizations. Procedures can be established for security and privacy programs, for mission or business processes, and for systems, if needed. Procedures describe how the policies or controls are implemented and can be directed at the individual or role that is the object of the procedure. Procedures can be documented in system security and privacy plans or in one or more separate documents. Events that may precipitate an update to maintenance policy and procedures assessment or audit findings, security incidents or breaches, or changes in applicable laws, executive orders, directives, regulations, policies, standards, and guidelines. Simply restating controls does not constitute an organizational policy or procedure.',
                99
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MA-2 Controlled Maintenance',
                'Include the following information in organizational maintenance records: [Assignment: organization-defined information].',
                'low,moderate,high',
                'Controlling system maintenance addresses the information security aspects of the system maintenance program and applies to all types of maintenance to system components conducted by local or nonlocal entities. Maintenance includes peripherals such as scanners, copiers, and printers. Information necessary for creating effective maintenance records includes the date and time of maintenance, a description of the maintenance performed, names of the individuals or group performing the maintenance, name of the escort, and system components or equipment that are removed or replaced. Organizations consider supply chain-related risks associated with replacement components for systems.',
                100
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'MA-2(2) Automated Maintenance Activities',
            'Schedule, conduct, and document maintenance, repair, and replacement actions for the system using [Assignment: organization-defined automated mechanisms]; and Produce up-to date, accurate, and complete records of all maintenance, repair, and replacement actions requested, scheduled, in process, and completed.',
            'The use of automated mechanisms to manage and control system maintenance programs and activities helps to ensure the generation of timely, accurate, complete, and consistent maintenance records.',
            'low,moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MA-3 Maintenance Tools',
                'Review previously approved system maintenance tools [Assignment: organization-defined frequency].',
                'moderate,high',
                'Approving, controlling, monitoring, and reviewing maintenance tools address security-related issues associated with maintenance tools that are not within system authorization boundaries and are used specifically for diagnostic and repair actions on organizational systems. Organizations have flexibility in determining roles for the approval of maintenance tools and how that approval is documented. A periodic review of maintenance tools facilitates the withdrawal of approval for outdated, unsupported, irrelevant, or no-longer-used tools. Maintenance tools can include hardware, software, and firmware items and may be pre-installed, brought in with maintenance personnel on media, cloud-based, or downloaded from a website. Such tools can be vehicles for transporting malicious code, either intentionally or unintentionally, into a facility and subsequently into systems. Maintenance tools can include hardware and software diagnostic test equipment and packet sniffers. The hardware and software components that support maintenance and are a part of the system (including the software implementing utilities such as &lt;q&gt;ping,&lt;/q&gt;
                       &lt;q&gt;ls,&lt;/q&gt;
                       &lt;q&gt;ipconfig,&lt;/q&gt; or the hardware and software implementing the monitoring port of an Ethernet switch) are not addressed by maintenance tools.',
                101
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'MA-3(1) Inspect Tools',
            'Inspect the maintenance tools used by maintenance personnel for improper or unauthorized modifications.',
            'Maintenance tools can be directly brought into a facility by maintenance personnel or downloaded from a vendor’s website. If, upon inspection of the maintenance tools, organizations determine that the tools have been modified in an improper manner or the tools contain malicious code, the incident is handled consistent with organizational policies and procedures for incident handling.',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-3(2) Inspect Media',
            'Check media containing diagnostic and test programs for malicious code before the media are used in the system.',
            'If, upon inspection of media containing maintenance, diagnostic, and test programs, organizations determine that the media contains malicious code, the incident is handled consistent with organizational incident handling policies and procedures.',
            'moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-3(3) Prevent Unauthorized Removal',
            'Prevent the removal of maintenance equipment containing organizational information by:',
            'Organizational information includes all information owned by organizations and any information provided to organizations for which the organizations serve as information stewards.',
            'moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-3(4) Restricted Tool Use',
            'Restrict the use of maintenance tools to authorized personnel only.',
            'Restricting the use of maintenance tools to only authorized personnel applies to systems that are used to carry out maintenance functions.',
            'moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-3(5) Execution With Privilege',
            'Monitor the use of maintenance tools that execute with increased privilege.',
            'Maintenance tools that execute with increased system privilege can result in unauthorized access to organizational information and assets that would otherwise be inaccessible.',
            'moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-3(6) Software Updates And Patches',
            'Inspect maintenance tools to ensure the latest software updates and patches are installed.',
            'Maintenance tools using outdated and/or unpatched software can provide a threat vector for adversaries and result in a significant vulnerability for organizations.',
            'moderate,high',
            6
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MA-4 Nonlocal Maintenance',
                'Terminate session and network connections when nonlocal maintenance is completed.',
                'low,moderate,high',
                'Nonlocal maintenance and diagnostic activities are conducted by individuals who communicate through either an external or internal network. Local maintenance and diagnostic activities are carried out by individuals who are physically present at the system location and not communicating across a network connection. Authentication techniques used to establish nonlocal maintenance and diagnostic sessions reflect the network access requirements in &lt;a href=&#34;#ia-2&#34;&gt;IA-2&lt;/a&gt;. Strong authentication requires authenticators that are resistant to replay attacks and employ multi-factor authentication. Strong authenticators include PKI where certificates are stored on a token protected by a password, passphrase, or biometric. Enforcing requirements in &lt;a href=&#34;#ma-4&#34;&gt;MA-4&lt;/a&gt; is accomplished, in part, by other controls. &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-63b&#34;&gt;SP 800-63B&lt;/a&gt; provides additional guidance on strong authentication and authenticators.',
                102
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'MA-4(1) Logging And Review',
            'Log [Assignment: organization-defined audit events] for nonlocal maintenance and diagnostic sessions; and Review the audit records of the maintenance and diagnostic sessions to detect anomalous behavior.',
            'Audit logging for nonlocal maintenance is enforced by &lt;a href=&#34;#au-2&#34;&gt;AU-2&lt;/a&gt;. Audit events are defined in &lt;a href=&#34;#au-2_smt.a&#34;&gt;AU-2a&lt;/a&gt;.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-4(3) Comparable Security And Sanitization',
            'Require that nonlocal maintenance and diagnostic services be performed from a system that implements a security capability comparable to the capability implemented on the system being serviced; or Remove the component to be serviced from the system prior to nonlocal maintenance or diagnostic services; sanitize the component (for organizational information); and after the service is performed, inspect and sanitize the component (for potentially malicious software) before reconnecting the component to the system.',
            'Comparable security capability on systems, diagnostic tools, and equipment providing maintenance services implies that the implemented controls on those systems, tools, and equipment are at least as comprehensive as the controls on the system being serviced.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-4(4) Authentication And Separation Of Maintenance Sessions',
            'Protect nonlocal maintenance sessions by:',
            'Communications paths can be logically separated using encryption.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-4(5) Approvals And Notifications',
            'Require the approval of each nonlocal maintenance session by [Assignment: organization-defined personnel or roles]; and Notify the following personnel or roles of the date and time of planned nonlocal maintenance: [Assignment: organization-defined personnel or roles].',
            'Notification may be performed by maintenance personnel. Approval of nonlocal maintenance is accomplished by personnel with sufficient information security and system knowledge to determine the appropriateness of the proposed maintenance.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-4(6) Cryptographic Protection',
            'Implement the following cryptographic mechanisms to protect the integrity and confidentiality of nonlocal maintenance and diagnostic communications: [Assignment: organization-defined cryptographic mechanisms].',
            'Failure to protect nonlocal maintenance and diagnostic communications can result in unauthorized individuals gaining access to organizational information. Unauthorized access during remote maintenance sessions can result in a variety of hostile actions, including malicious code insertion, unauthorized changes to system parameters, and exfiltration of organizational information. Such actions can result in the loss or degradation of mission or business capabilities.',
            'low,moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-4(7) Disconnect Verification',
            'Verify session and network connection termination after the completion of nonlocal maintenance and diagnostic sessions.',
            'Verifying the termination of a connection once maintenance is completed ensures that connections established during nonlocal maintenance and diagnostic sessions have been terminated and are no longer available for use.',
            'low,moderate,high',
            6
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MA-5 Maintenance Personnel',
                'Designate organizational personnel with required access authorizations and technical competence to supervise the maintenance activities of personnel who do not possess the required access authorizations.',
                'low,moderate,high',
                'Maintenance personnel refers to individuals who perform hardware or software maintenance on organizational systems, while &lt;a href=&#34;#pe-2&#34;&gt;PE-2&lt;/a&gt; addresses physical access for individuals whose maintenance duties place them within the physical protection perimeter of the systems. Technical competence of supervising individuals relates to the maintenance performed on the systems, while having required access authorizations refers to maintenance on and near the systems. Individuals not previously identified as authorized maintenance personnel—such as information technology manufacturers, vendors, systems integrators, and consultants—may require privileged access to organizational systems, such as when they are required to conduct maintenance activities with little or no notice. Based on organizational assessments of risk, organizations may issue temporary credentials to these individuals. Temporary credentials may be for one-time use or for very limited time periods.',
                103
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'MA-5(1) Individuals Without Appropriate Access',
            'Implement procedures for the use of maintenance personnel that lack appropriate security clearances or are not U.S. citizens, that include the following requirements: Develop and implement [Assignment: organization-defined alternate controls] in the event a system component cannot be sanitized, removed, or disconnected from the system.',
            'Procedures for individuals who lack appropriate security clearances or who are not U.S. citizens are intended to deny visual and electronic access to classified or controlled unclassified information contained on organizational systems. Procedures for the use of maintenance personnel can be documented in security plans for the systems.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-5(2) Security Clearances For Classified Systems',
            'Verify that personnel performing maintenance and diagnostic activities on a system processing, storing, or transmitting classified information possess security clearances and formal access approvals for at least the highest classification level and for compartments of information on the system.',
            'Personnel who conduct maintenance on organizational systems may be exposed to classified information during the course of their maintenance activities. To mitigate the inherent risk of such exposure, organizations use maintenance personnel that are cleared (i.e., possess security clearances) to the classification level of the information stored on the system.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-5(3) Citizenship Requirements For Classified Systems',
            'Verify that personnel performing maintenance and diagnostic activities on a system processing, storing, or transmitting classified information are U.S. citizens.',
            'Personnel who conduct maintenance on organizational systems may be exposed to classified information during the course of their maintenance activities. If access to classified information on organizational systems is restricted to U.S. citizens, the same restriction is applied to personnel performing maintenance on those systems.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-5(4) Foreign Nationals',
            'Ensure that:',
            'Personnel who conduct maintenance and diagnostic activities on organizational systems may be exposed to classified information. If non-U.S. citizens are permitted to perform maintenance and diagnostics activities on classified systems, then additional vetting is required to ensure agreements and restrictions are not being violated.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-5(5) Non-system Maintenance',
            'Ensure that non-escorted personnel performing maintenance activities not directly associated with the system but in the physical proximity of the system, have required access authorizations.',
            'Personnel who perform maintenance activities in other capacities not directly related to the system include physical plant personnel and custodial personnel.',
            'low,moderate,high',
            5
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MA-6 Timely Maintenance',
                'Obtain maintenance support and/or spare parts for [Assignment: organization-defined system components] within [Assignment: organization-defined time period] of failure.',
                'moderate,high',
                'Organizations specify the system components that result in increased risk to organizational operations and assets, individuals, other organizations, or the Nation when the functionality provided by those components is not operational. Organizational actions to obtain maintenance support include having appropriate contracts in place.',
                104
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'MA-6(1) Preventive Maintenance',
            'Perform preventive maintenance on [Assignment: organization-defined system components] at [Assignment: organization-defined time intervals].',
            'Preventive maintenance includes proactive care and the servicing of system components to maintain organizational equipment and facilities in satisfactory operating condition. Such maintenance provides for the systematic inspection, tests, measurements, adjustments, parts replacement, detection, and correction of incipient failures either before they occur or before they develop into major defects. The primary goal of preventive maintenance is to avoid or mitigate the consequences of equipment failures. Preventive maintenance is designed to preserve and restore equipment reliability by replacing worn components before they fail. Methods of determining what preventive (or other) failure management policies to apply include original equipment manufacturer recommendations; statistical failure records; expert opinion; maintenance that has already been conducted on similar equipment; requirements of codes, laws, or regulations within a jurisdiction; or measured values and performance indications.',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-6(2) Predictive Maintenance',
            'Perform predictive maintenance on [Assignment: organization-defined system components] at [Assignment: organization-defined time intervals].',
            'Predictive maintenance evaluates the condition of equipment by performing periodic or continuous (online) equipment condition monitoring. The goal of predictive maintenance is to perform maintenance at a scheduled time when the maintenance activity is most cost-effective and before the equipment loses performance within a threshold. The predictive component of predictive maintenance stems from the objective of predicting the future trend of the equipment&#39;s condition. The predictive maintenance approach employs principles of statistical process control to determine at what point in the future maintenance activities will be appropriate. Most predictive maintenance inspections are performed while equipment is in service, thus minimizing disruption of normal system operations. Predictive maintenance can result in substantial cost savings and higher system reliability.',
            'moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'MA-6(3) Automated Support For Predictive Maintenance',
            'Transfer predictive maintenance data to a maintenance management system using [Assignment: organization-defined automated mechanisms].',
            'A computerized maintenance management system maintains a database of information about the maintenance operations of organizations and automates the processing of equipment condition data to trigger maintenance planning, execution, and reporting.',
            'moderate,high',
            3
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MA-7 Field Maintenance',
                'Restrict or prohibit field maintenance on [Assignment: organization-defined systems or system components] to [Assignment: organization-defined trusted maintenance facilities].',
                'moderate',
                'Field maintenance is the type of maintenance conducted on a system or system component after the system or component has been deployed to a specific site (i.e., operational environment). In certain instances, field maintenance (i.e., local maintenance at the site) may not be executed with the same degree of rigor or with the same quality control checks as depot maintenance. For critical systems designated as such by the organization, it may be necessary to restrict or prohibit field maintenance at the local site and require that such maintenance be conducted in trusted facilities with additional controls.',
                105
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Maintenance';

        await queryRunner.query(`
            DELETE FROM standard_control_enhancements 
            WHERE control_id IN (
                SELECT id FROM standard_controls 
                WHERE standard_control_category_id = (
                    SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1
                )
            );
        `, [categoryName]);

        await queryRunner.query(`
            DELETE FROM standard_controls 
            WHERE standard_control_category_id = (
                SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1
            );
        `, [categoryName]);
    }

}
