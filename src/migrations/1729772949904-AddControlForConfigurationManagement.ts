import { MigrationInterface, QueryRunner } from "typeorm";

export class AddControlForConfigurationManagement1729772949904 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Configuration Management';

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-1 Policy And Procedures',
                'Review and update the current configuration management:',
                'low,moderate,high',
                'Configuration management policy and procedures address the controls in the CM family that are implemented within systems and organizations. The risk management strategy is an important factor in establishing such policies and procedures. Policies and procedures contribute to security and privacy assurance. Therefore, it is important that security and privacy programs collaborate on the development of configuration management policy and procedures. Security and privacy program policies and procedures at the organization level are preferable, in general, and may obviate the need for mission- or system-specific policies and procedures. The policy can be included as part of the general security and privacy policy or be represented by multiple policies that reflect the complex nature of organizations. Procedures can be established for security and privacy programs, for mission/business processes, and for systems, if needed. Procedures describe how the policies or controls are implemented and can be directed at the individual or role that is the object of the procedure. Procedures can be documented in system security and privacy plans or in one or more separate documents. Events that may precipitate an update to configuration management policy and procedures include, but are not limited to, assessment or audit findings, security incidents or breaches, or changes in applicable laws, executive orders, directives, regulations, policies, standards, and guidelines. Simply restating controls does not constitute an organizational policy or procedure.',
                52
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-2 Baseline Configuration',
                'Review and update the baseline configuration of the system:',
                'low,moderate,high',
                'Baseline configurations for systems and system components include connectivity, operational, and communications aspects of systems. Baseline configurations are documented, formally reviewed, and agreed-upon specifications for systems or configuration items within those systems. Baseline configurations serve as a basis for future builds, releases, or changes to systems and include security and privacy control implementations, operational procedures, information about system components, network topology, and logical placement of components in the system architecture. Maintaining baseline configurations requires creating new baselines as organizational systems change over time. Baseline configurations of systems reflect the current enterprise architecture.',
                53
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'CM-2(2) Automation Support For Accuracy And Currency',
            'Maintain the currency, completeness, accuracy, and availability of the baseline configuration of the system using [Assignment: organization-defined automated mechanisms].',
            'Automated mechanisms that help organizations maintain consistent baseline configurations for systems include configuration management tools, hardware, software, firmware inventory tools, and network management tools. Automated tools can be used at the organization level, mission and business process level, or system level on workstations, servers, notebook computers, network components, or mobile devices. Tools can be used to track version numbers on operating systems, applications, types of software installed, and current patch levels. Automation support for accuracy and currency can be satisfied by the implementation of &lt;a href=&#34;#cm-8.2&#34;&gt;CM-8(2)&lt;/a&gt; for organizations that combine system component inventory and baseline configuration activities.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-2(3) Retention Of Previous Configurations',
            'Retain [Assignment: organization-defined number] of previous versions of baseline configurations of the system to support rollback.',
            'Retaining previous versions of baseline configurations to support rollback include hardware, software, firmware, configuration files, configuration records, and associated documentation.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-2(6) Development And Test Environments',
            'Maintain a baseline configuration for system development and test environments that is managed separately from the operational baseline configuration.',
            'Establishing separate baseline configurations for development, testing, and operational environments protects systems from unplanned or unexpected events related to development and testing activities. Separate baseline configurations allow organizations to apply the configuration management that is most appropriate for each type of configuration. For example, the management of operational configurations typically emphasizes the need for stability, while the management of development or test configurations requires greater flexibility. Configurations in the test environment mirror configurations in the operational environment to the extent practicable so that the results of the testing are representative of the proposed changes to the operational systems. Separate baseline configurations do not necessarily require separate physical environments.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-2(7) Configure Systems And Components For High-risk Areas',
            'Issue [Assignment: organization-defined systems or system components] with [Assignment: organization-defined configurations] to individuals traveling to locations that the organization deems to be of significant risk; and Apply the following controls to the systems or components when the individuals return from travel: [Assignment: organization-defined controls].',
            'When it is known that systems or system components will be in high-risk areas external to the organization, additional controls may be implemented to counter the increased threat in such areas. For example, organizations can take actions for notebook computers used by individuals departing on and returning from travel. Actions include determining the locations that are of concern, defining the required configurations for the components, ensuring that components are configured as intended before travel is initiated, and applying controls to the components after travel is completed. Specially configured notebook computers include computers with sanitized hard drives, limited applications, and more stringent configuration settings. Controls applied to mobile devices upon return from travel include examining the mobile device for signs of physical tampering and purging and reimaging disk drives. Protecting information that resides on mobile devices is addressed in the &lt;a href=&#34;#mp&#34;&gt;MP&lt;/a&gt; (Media Protection) family.',
            'low,moderate,high',
            4
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-3 Configuration Change Control',
                'Coordinate and provide oversight for configuration change control activities through [Assignment: organization-defined configuration change control element] that convenes [Selection (one or more): [Assignment: organization-defined frequency]; when [Assignment: organization-defined configuration change conditions]].',
                'moderate,high',
                'Configuration change control for organizational systems involves the systematic proposal, justification, implementation, testing, review, and disposition of system changes, including system upgrades and modifications. Configuration change control includes changes to baseline configurations, configuration items of systems, operational procedures, configuration settings for system components, remediate vulnerabilities, and unscheduled or unauthorized changes. Processes for managing configuration changes to systems include Configuration Control Boards or Change Advisory Boards that review and approve proposed changes. For changes that impact privacy risk, the senior agency official for privacy updates privacy impact assessments and system of records notices. For new systems or major upgrades, organizations consider including representatives from the development organizations on the Configuration Control Boards or Change Advisory Boards. Auditing of changes includes activities before and after changes are made to systems and the auditing activities required to implement such changes. See also &lt;a href=&#34;#sa-10&#34;&gt;SA-10&lt;/a&gt;.',
                54
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'CM-3(1) Automated Documentation, Notification, And Prohibition Of Changes',
            'Use [Assignment: organization-defined automated mechanisms] to:',
            'None.',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-3(2) Testing, Validation, And Documentation Of Changes',
            'Test, validate, and document changes to the system before finalizing the implementation of the changes.',
            'Changes to systems include modifications to hardware, software, or firmware components and configuration settings defined in &lt;a href=&#34;#cm-6&#34;&gt;CM-6&lt;/a&gt;. Organizations ensure that testing does not interfere with system operations that support organizational mission and business functions. Individuals or groups conducting tests understand security and privacy policies and procedures, system security and privacy policies and procedures, and the health, safety, and environmental risks associated with specific facilities or processes. Operational systems may need to be taken offline, or replicated to the extent feasible, before testing can be conducted. If systems must be taken offline for testing, the tests are scheduled to occur during planned system outages whenever possible. If the testing cannot be conducted on operational systems, organizations employ compensating controls.',
            'moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-3(3) Automated Change Implementation',
            'Implement changes to the current system baseline and deploy the updated baseline across the installed base using [Assignment: organization-defined automated mechanisms].',
            'Automated tools can improve the accuracy, consistency, and availability of configuration baseline information. Automation can also provide data aggregation and data correlation capabilities, alerting mechanisms, and dashboards to support risk-based decision-making within the organization.',
            'moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-3(4) Security And Privacy Representatives',
            'Require [Assignment: organization-defined security and privacy representatives] to be members of the [Assignment: organization-defined configuration change control element].',
            'Information security and privacy representatives include system security officers, senior agency information security officers, senior agency officials for privacy, or system privacy officers. Representation by personnel with information security and privacy expertise is important because changes to system configurations can have unintended side effects, some of which may be security- or privacy-relevant. Detecting such changes early in the process can help avoid unintended, negative consequences that could ultimately affect the security and privacy posture of systems. The configuration change control element referred to in the second organization-defined parameter reflects the change control elements defined by organizations in &lt;a href=&#34;#cm-3_smt.g&#34;&gt;CM-3g&lt;/a&gt;.',
            'moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-3(5) Automated Security Response',
            'Implement the following security responses automatically if baseline configurations are changed in an unauthorized manner: [Assignment: organization-defined security responses].',
            'Automated security responses include halting selected system functions, halting system processing, and issuing alerts or notifications to organizational personnel when there is an unauthorized modification of a configuration item.',
            'moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-3(6) Cryptography Management',
            'Ensure that cryptographic mechanisms used to provide the following controls are under configuration management: [Assignment: organization-defined controls].',
            'The controls referenced in the control enhancement refer to security and privacy controls from the control catalog. Regardless of the cryptographic mechanisms employed, processes and procedures are in place to manage those mechanisms. For example, if system components use certificates for identification and authentication, a process is implemented to address the expiration of those certificates.',
            'moderate,high',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-3(7) Review System Changes',
            'Review changes to the system [Assignment: organization-defined frequency] or when [Assignment: organization-defined circumstances] to determine whether unauthorized changes have occurred.',
            'Indications that warrant a review of changes to the system and the specific circumstances justifying such reviews may be obtained from activities carried out by organizations during the configuration change process or continuous monitoring process.',
            'moderate,high',
            7
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-3(8) Prevent Or Restrict Configuration Changes',
            'Prevent or restrict changes to the configuration of the system under the following circumstances: [Assignment: organization-defined circumstances].',
            'System configuration changes can adversely affect critical system security and privacy functionality. Change restrictions can be enforced through automated mechanisms.',
            'moderate,high',
            8
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-4 Impact Analyses',
                'Analyze changes to the system to determine potential security and privacy impacts prior to change implementation.',
                'low,moderate,high',
                'Organizational personnel with security or privacy responsibilities conduct impact analyses. Individuals conducting impact analyses possess the necessary skills and technical expertise to analyze the changes to systems as well as the security or privacy ramifications. Impact analyses include reviewing security and privacy plans, policies, and procedures to understand control requirements; reviewing system design documentation and operational procedures to understand control implementation and how specific system changes might affect the controls; reviewing the impact of changes on organizational supply chain partners with stakeholders; and determining how potential changes to a system create new risks to the privacy of individuals and the ability of implemented controls to mitigate those risks. Impact analyses also include risk assessments to understand the impact of the changes and determine if additional controls are required.',
                55
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'CM-4(1) Separate Test Environments',
            'Analyze changes to the system in a separate test environment before implementation in an operational environment, looking for security and privacy impacts due to flaws, weaknesses, incompatibility, or intentional malice.',
            'A separate test environment requires an environment that is physically or logically separate and distinct from the operational environment. The separation is sufficient to ensure that activities in the test environment do not impact activities in the operational environment and that information in the operational environment is not inadvertently transmitted to the test environment. Separate environments can be achieved by physical or logical means. If physically separate test environments are not implemented, organizations determine the strength of mechanism required when implementing logical separation.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-4(2) Verification Of Controls',
            'After system changes, verify that the impacted controls are implemented correctly, operating as intended, and producing the desired outcome with regard to meeting the security and privacy requirements for the system.',
            'Implementation in this context refers to installing changed code in the operational system that may have an impact on security or privacy controls.',
            'low,moderate,high',
            2
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-5 Access Restrictions For Change',
                'Define, document, approve, and enforce physical and logical access restrictions associated with changes to the system.',
                'low,moderate,high',
                'Changes to the hardware, software, or firmware components of systems or the operational procedures related to the system can potentially have significant effects on the security of the systems or individuals’ privacy. Therefore, organizations permit only qualified and authorized individuals to access systems for purposes of initiating changes. Access restrictions include physical and logical access controls (see &lt;a href=&#34;#ac-3&#34;&gt;AC-3&lt;/a&gt; and &lt;a href=&#34;#pe-3&#34;&gt;PE-3&lt;/a&gt;), software libraries, workflow automation, media libraries, abstract layers (i.e., changes implemented into external interfaces rather than directly into systems), and change windows (i.e., changes occur only during specified times).',
                56
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'CM-5(1) Automated Access Enforcement And Audit Records',
            'Enforce access restrictions using [Assignment: organization-defined automated mechanisms]; and Automatically generate audit records of the enforcement actions.',
            'Organizations log system accesses associated with applying configuration changes to ensure that configuration change control is implemented and to support after-the-fact actions should organizations discover any unauthorized changes.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-5(4) Dual Authorization',
            'Enforce dual authorization for implementing changes to [Assignment: organization-defined system components and system-level information].',
            'Organizations employ dual authorization to help ensure that any changes to selected system components and information cannot occur unless two qualified individuals approve and implement such changes. The two individuals possess the skills and expertise to determine if the proposed changes are correct implementations of approved changes. The individuals are also accountable for the changes. Dual authorization may also be known as two-person control. To reduce the risk of collusion, organizations consider rotating dual authorization duties to other individuals. System-level information includes operational procedures.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-5(5) Privilege Limitation For Production And Operation',
            'Limit privileges to change system components and system-related information within a production or operational environment; and Review and reevaluate privileges [Assignment: organization-defined frequency].',
            'In many organizations, systems support multiple mission and business functions. Limiting privileges to change system components with respect to operational systems is necessary because changes to a system component may have far-reaching effects on mission and business processes supported by the system. The relationships between systems and mission/business processes are, in some cases, unknown to developers. System-related information includes operational procedures.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-5(6) Limit Library Privileges',
            'Limit privileges to change software resident within software libraries.',
            'Software libraries include privileged programs.',
            'low,moderate,high',
            4
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-6 Configuration Settings',
                'Monitor and control changes to the configuration settings in accordance with organizational policies and procedures.',
                'low,moderate,high',
                'Implementation of a common secure configuration may be mandated at the organization level, mission and business process level, system level, or at a higher level, including by a regulatory agency. Common secure configurations include the United States Government Configuration Baseline &lt;a href=&#34;https://csrc.nist.gov/projects/united-states-government-configuration-baseline&#34;&gt;USGCB&lt;/a&gt; and security technical implementation guides (STIGs), which affect the implementation of &lt;a href=&#34;#cm-6&#34;&gt;CM-6&lt;/a&gt; and other controls such as &lt;a href=&#34;#ac-19&#34;&gt;AC-19&lt;/a&gt; and &lt;a href=&#34;#cm-7&#34;&gt;CM-7&lt;/a&gt;. The Security Content Automation Protocol (SCAP) and the defined standards within the protocol provide an effective method to uniquely identify, track, and control configuration settings.',
                57
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'CM-6(1) Automated Management, Application, And Verification',
            'Manage, apply, and verify configuration settings for [Assignment: organization-defined system components] using [Assignment: organization-defined automated mechanisms].',
            'Automated tools (e.g., hardening tools, baseline configuration tools) can improve the accuracy, consistency, and availability of configuration settings information. Automation can also provide data aggregation and data correlation capabilities, alerting mechanisms, and dashboards to support risk-based decision-making within the organization.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-6(2) Respond To Unauthorized Changes',
            'Take the following actions in response to unauthorized changes to [Assignment: organization-defined configuration settings]: [Assignment: organization-defined actions].',
            'Responses to unauthorized changes to configuration settings include alerting designated organizational personnel, restoring established configuration settings, or—in extreme cases—halting affected system processing.',
            'low,moderate,high',
            2
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-7 Least Functionality',
                'Prohibit or restrict the use of the following functions, ports, protocols, software, and/or services: [Assignment: organization-defined prohibited or restricted functions, system ports, protocols, software, and/or services].',
                'low,moderate,high',
                'Systems provide a wide variety of functions and services. Some of the functions and services routinely provided by default may not be necessary to support essential organizational missions, functions, or operations. Additionally, it is sometimes convenient to provide multiple services from a single system component, but doing so increases risk over limiting the services provided by that single component. Where feasible, organizations limit component functionality to a single function per component. Organizations consider removing unused or unnecessary software and disabling unused or unnecessary physical and logical ports and protocols to prevent unauthorized connection of components, transfer of information, and tunneling. Organizations employ network scanning tools, intrusion detection and prevention systems, and end-point protection technologies, such as firewalls and host-based intrusion detection systems, to identify and prevent the use of prohibited functions, protocols, ports, and services. Least functionality can also be achieved as part of the fundamental design and development of the system (see &lt;a href=&#34;#sa-8&#34;&gt;SA-8&lt;/a&gt;, &lt;a href=&#34;#sc-2&#34;&gt;SC-2&lt;/a&gt;, and &lt;a href=&#34;#sc-3&#34;&gt;SC-3&lt;/a&gt;).',
                58
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'CM-7(1) Periodic Review',
            'Review the system [Assignment: organization-defined frequency] to identify unnecessary and/or nonsecure functions, ports, protocols, software, and services; and Disable or remove [Assignment: organization-defined functions, ports, protocols, software, and services within the system deemed to be unnecessary and/or nonsecure].',
            'Organizations review functions, ports, protocols, and services provided by systems or system components to determine the functions and services that are candidates for elimination. Such reviews are especially important during transition periods from older technologies to newer technologies (e.g., transition from IPv4 to IPv6). These technology transitions may require implementing the older and newer technologies simultaneously during the transition period and returning to minimum essential functions, ports, protocols, and services at the earliest opportunity. Organizations can either decide the relative security of the function, port, protocol, and/or service or base the security decision on the assessment of other entities. Unsecure protocols include Bluetooth, FTP, and peer-to-peer networking.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-7(2) Prevent Program Execution',
            'Prevent program execution in accordance with [Selection (one or more): [Assignment: organization-defined policies, rules of behavior, and/or access agreements regarding software program usage and restrictions]; rules authorizing the terms and conditions of software program usage].',
            'Prevention of program execution addresses organizational policies, rules of behavior, and/or access agreements that restrict software usage and the terms and conditions imposed by the developer or manufacturer, including software licensing and copyrights. Restrictions include prohibiting auto-execute features, restricting roles allowed to approve program execution, permitting or prohibiting specific software programs, or restricting the number of program instances executed at the same time.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-7(3) Registration Compliance',
            'Ensure compliance with [Assignment: organization-defined registration requirements for functions, ports, protocols, and services].',
            'Organizations use the registration process to manage, track, and provide oversight for systems and implemented functions, ports, protocols, and services.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-7(4) Unauthorized Software - Deny-by-exception',
            'Identify [Assignment: organization-defined software programs not authorized to execute on the system]; Employ an allow-all, deny-by-exception policy to prohibit the execution of unauthorized software programs on the system; and Review and update the list of unauthorized software programs [Assignment: organization-defined frequency].',
            'Unauthorized software programs can be limited to specific versions or from a specific source. The concept of prohibiting the execution of unauthorized software may also be applied to user actions, system ports and protocols, IP addresses/ranges, websites, and MAC addresses.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-7(5) Authorized Software - Allow-by-exception',
            'Identify [Assignment: organization-defined software programs authorized to execute on the system]; Employ a deny-all, permit-by-exception policy to allow the execution of authorized software programs on the system; and Review and update the list of authorized software programs [Assignment: organization-defined frequency].',
            'Authorized software programs can be limited to specific versions or from a specific source. To facilitate a comprehensive authorized software process and increase the strength of protection for attacks that bypass application level authorized software, software programs may be decomposed into and monitored at different levels of detail. These levels include applications, application programming interfaces, application modules, scripts, system processes, system services, kernel functions, registries, drivers, and dynamic link libraries. The concept of permitting the execution of authorized software may also be applied to user actions, system ports and protocols, IP addresses/ranges, websites, and MAC addresses. Organizations consider verifying the integrity of authorized software programs using digital signatures, cryptographic checksums, or hash functions. Verification of authorized software can occur either prior to execution or at system startup. The identification of authorized URLs for websites is addressed in &lt;a href=&#34;#ca-3.5&#34;&gt;CA-3(5)&lt;/a&gt; and &lt;a href=&#34;#sc-7&#34;&gt;SC-7&lt;/a&gt;.',
            'low,moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-7(6) Confined Environments With Limited Privileges',
            'Require that the following user-installed software execute in a confined physical or virtual machine environment with limited privileges: [Assignment: organization-defined user-installed software].',
            'Organizations identify software that may be of concern regarding its origin or potential for containing malicious code. For this type of software, user installations occur in confined environments of operation to limit or contain damage from malicious code that may be executed.',
            'low,moderate,high',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-7(7) Code Execution In Protected Environments',
            'Allow execution of binary or machine-executable code only in confined physical or virtual machine environments and with the explicit approval of [Assignment: organization-defined personnel or roles] when such code is:',
            'Code execution in protected environments applies to all sources of binary or machine-executable code, including commercial software and firmware and open-source software.',
            'low,moderate,high',
            7
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-7(8) Binary Or Machine Executable Code',
            'Prohibit the use of binary or machine-executable code from sources with limited or no warranty or without the provision of source code; and Allow exceptions only for compelling mission or operational requirements and with the approval of the authorizing official.',
            'Binary or machine executable code applies to all sources of binary or machine-executable code, including commercial software and firmware and open-source software. Organizations assess software products without accompanying source code or from sources with limited or no warranty for potential security impacts. The assessments address the fact that software products without the provision of source code may be difficult to review, repair, or extend. In addition, there may be no owners to make such repairs on behalf of organizations. If open-source software is used, the assessments address the fact that there is no warranty, the open-source software could contain back doors or malware, and there may be no support available.',
            'low,moderate,high',
            8
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-7(9) Prohibiting The Use Of Unauthorized Hardware',
            'Identify [Assignment: organization-defined hardware components authorized for system use]; Prohibit the use or connection of unauthorized hardware components; Review and update the list of authorized hardware components [Assignment: organization-defined frequency].',
            'Hardware components provide the foundation for organizational systems and the platform for the execution of authorized software programs. Managing the inventory of hardware components and controlling which hardware components are permitted to be installed or connected to organizational systems is essential in order to provide adequate security.',
            'low,moderate,high',
            9
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-8 System Component Inventory',
                'Review and update the system component inventory [Assignment: organization-defined frequency].',
                'low,moderate,high',
                'Preventing duplicate accounting of system components addresses the lack of accountability that occurs when component ownership and system association is not known, especially in large or complex connected systems. Effective prevention of duplicate accounting of system components necessitates use of a unique identifier for each component. For software inventory, centrally managed software that is accessed via other systems is addressed as a component of the system on which it is installed and managed. Software installed on multiple organizational systems and managed at the system level is addressed for each individual system and may appear more than once in a centralized component inventory, necessitating a system association for each software instance in the centralized inventory to avoid duplicate accounting of components. Scanning systems implementing multiple network protocols (e.g., IPv4 and IPv6) can result in duplicate components being identified in different address spaces. The implementation of &lt;a href=&#34;#cm-8.7&#34;&gt;CM-8(7)&lt;/a&gt; can help to eliminate duplicate accounting of components.',
                59
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'CM-8(1) Updates During Installation And Removal',
            'Update the inventory of system components as part of component installations, removals, and system updates.',
            'Organizations can improve the accuracy, completeness, and consistency of system component inventories if the inventories are updated as part of component installations or removals or during general system updates. If inventories are not updated at these key times, there is a greater likelihood that the information will not be appropriately captured and documented. System updates include hardware, software, and firmware components.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-8(2) Automated Maintenance',
            'Maintain the currency, completeness, accuracy, and availability of the inventory of system components using [Assignment: organization-defined automated mechanisms].',
            'Organizations maintain system inventories to the extent feasible. For example, virtual machines can be difficult to monitor because such machines are not visible to the network when not in use. In such cases, organizations maintain as up-to-date, complete, and accurate an inventory as is deemed reasonable. Automated maintenance can be achieved by the implementation of &lt;a href=&#34;#cm-2.2&#34;&gt;CM-2(2)&lt;/a&gt; for organizations that combine system component inventory and baseline configuration activities.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-8(3) Automated Unauthorized Component Detection',
            'Detect the presence of unauthorized hardware, software, and firmware components within the system using [Assignment: organization-defined automated mechanisms] [Assignment: organization-defined frequency]; and Take the following actions when unauthorized components are detected: [Selection (one or more): disable network access by such components; isolate the components; notify [Assignment: organization-defined personnel or roles]].',
            'Automated unauthorized component detection is applied in addition to the monitoring for unauthorized remote connections and mobile devices. Monitoring for unauthorized system components may be accomplished on an ongoing basis or by the periodic scanning of systems for that purpose. Automated mechanisms may also be used to prevent the connection of unauthorized components (see &lt;a href=&#34;#cm-7.9&#34;&gt;CM-7(9)&lt;/a&gt;). Automated mechanisms can be implemented in systems or in separate system components. When acquiring and implementing automated mechanisms, organizations consider whether such mechanisms depend on the ability of the system component to support an agent or supplicant in order to be detected since some types of components do not have or cannot support agents (e.g., IoT devices, sensors). Isolation can be achieved , for example, by placing unauthorized system components in separate domains or subnets or quarantining such components. This type of  component isolation is commonly referred to as &lt;q&gt;sandboxing.&lt;/q&gt;',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-8(4) Accountability Information',
            'Include in the system component inventory information, a means for identifying by [Selection (one or more): name; position; role], individuals responsible and accountable for administering those components.',
            'Identifying individuals who are responsible and accountable for administering system components ensures that the assigned components are properly administered and that organizations can contact those individuals if some action is required (e.g., when the component is determined to be the source of a breach, needs to be recalled or replaced, or needs to be relocated).',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-8(6) Assessed Configurations And Approved Deviations',
            'Include assessed component configurations and any approved deviations to current deployed configurations in the system component inventory.',
            'Assessed configurations and approved deviations focus on configuration settings established by organizations for system components, the specific components that have been assessed to determine compliance with the required configuration settings, and any approved deviations from established configuration settings.',
            'low,moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-8(7) Centralized Repository',
            'Provide a centralized repository for the inventory of system components.',
            'Organizations may implement centralized system component inventories that include components from all organizational systems. Centralized repositories of component inventories provide opportunities for efficiencies in accounting for organizational hardware, software, and firmware assets. Such repositories may also help organizations rapidly identify the location and responsible individuals of components that have been compromised, breached, or are otherwise in need of mitigation actions. Organizations ensure that the resulting centralized inventories include system-specific information required for proper component accountability.',
            'low,moderate,high',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-8(8) Automated Location Tracking',
            'Support the tracking of system components by geographic location using [Assignment: organization-defined automated mechanisms].',
            'The use of automated mechanisms to track the location of system components can increase the accuracy of component inventories. Such capability may help organizations rapidly identify the location and responsible individuals of system components that have been compromised, breached, or are otherwise in need of mitigation actions. The use of tracking mechanisms can be coordinated with senior agency officials for privacy if there are implications that affect individual privacy.',
            'low,moderate,high',
            7
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-8(9) Assignment Of Components To Systems',
            'Assign system components to a system; and Receive an acknowledgement from [Assignment: organization-defined personnel or roles] of this assignment.',
            'System components that are not assigned to a system may be unmanaged, lack the required protection, and become an organizational vulnerability.',
            'low,moderate,high',
            8
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-9 Configuration Management Plan',
                'Protects the configuration management plan from unauthorized disclosure and modification.',
                'moderate,high',
                'Organizations can employ templates to help ensure the consistent and timely development and implementation of configuration management plans. Templates can represent a configuration management plan for the organization with subsets of the plan implemented on a system by system basis. Configuration management approval processes include the designation of key stakeholders responsible for reviewing and approving proposed changes to systems, and personnel who conduct security and privacy impact analyses prior to the implementation of changes to the systems. Configuration items are the system components, such as the hardware, software, firmware, and documentation to be configuration-managed. As systems continue through the system development life cycle, new configuration items may be identified, and some existing configuration items may no longer need to be under configuration control.',
                60
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'CM-9(1) Assignment Of Responsibility',
            'Assign responsibility for developing the configuration management process to organizational personnel that are not directly involved in system development.',
            'In the absence of dedicated configuration management teams assigned within organizations, system developers may be tasked with developing configuration management processes using personnel who are not directly involved in system development or system integration. This separation of duties ensures that organizations establish and maintain a sufficient degree of independence between the system development and integration processes and configuration management processes to facilitate quality control and more effective oversight.',
            'moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-10 Software Usage Restrictions',
                'Control and document the use of peer-to-peer file sharing technology to ensure that this capability is not used for the unauthorized distribution, display, performance, or reproduction of copyrighted work.',
                'low,moderate,high',
                'Software license tracking can be accomplished by manual or automated methods, depending on organizational needs. Examples of contract agreements include software license agreements and non-disclosure agreements.',
                61
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'CM-10(1) Open-source Software',
            'Establish the following restrictions on the use of open-source software: [Assignment: organization-defined restrictions].',
            'Open-source software refers to software that is available in source code form. Certain software rights normally reserved for copyright holders are routinely provided under software license agreements that permit individuals to study, change, and improve the software. From a security perspective, the major advantage of open-source software is that it provides organizations with the ability to examine the source code. In some cases, there is an online community associated with the software that inspects, tests,  updates, and reports on issues found in software on an ongoing basis. However, remediating vulnerabilities in open-source software may be problematic. There may also be licensing issues associated with open-source software, including the constraints on derivative use of such software. Open-source software that is available only in binary form may increase the level of risk in using such software.',
            'low,moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-11 User-installed Software',
                'Monitor policy compliance [Assignment: organization-defined frequency].',
                'low,moderate,high',
                'If provided the necessary privileges, users can install software in organizational systems. To maintain control over the software installed, organizations identify permitted and prohibited actions regarding software installation. Permitted software installations include updates and security patches to existing software and downloading new applications from organization-approved &lt;q&gt;app stores.&lt;/q&gt; Prohibited software installations include software with unknown or suspect pedigrees or software that organizations consider potentially malicious. Policies selected for governing user-installed software are organization-developed or provided by some external entity. Policy enforcement methods can include procedural methods and automated methods.',
                62
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'CM-11(2) Software Installation With Privileged Status',
            'Allow user installation of software only with explicit privileged status.',
            'Privileged status can be obtained, for example, by serving in the role of system administrator.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'CM-11(3) Automated Enforcement And Monitoring',
            'Enforce and monitor compliance with software installation policies using [Assignment: organization-defined automated mechanisms].',
            'Organizations enforce and monitor compliance with software installation policies using automated mechanisms to more quickly detect and respond to unauthorized software installation which can be an indicator of an internal or external hostile attack.',
            'low,moderate,high',
            2
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-12 Information Location',
                'Document changes to the location (i.e., system or system components) where the information is processed and stored.',
                'moderate,high',
                'Information location addresses the need to understand where information is being processed and stored. Information location includes identifying where specific information types and information reside in system components and how information is being processed so that information flow can be understood and adequate protection and policy management provided for such information and system components. The security category of the information is also a factor in determining the controls necessary to protect the information and the system component where the information resides (see &lt;a href=&#34;https://doi.org/10.6028/NIST.FIPS.199&#34;&gt;FIPS 199&lt;/a&gt;). The location of the information and system components is also a factor in the architecture and design of the system (see &lt;a href=&#34;#sa-4&#34;&gt;SA-4&lt;/a&gt;, &lt;a href=&#34;#sa-8&#34;&gt;SA-8&lt;/a&gt;, &lt;a href=&#34;#sa-17&#34;&gt;SA-17&lt;/a&gt;).',
                63
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'CM-12(1) Automated Tools To Support Information Location',
            'Use automated tools to identify [Assignment: organization-defined information by information type] on [Assignment: organization-defined system components] to ensure controls are in place to protect organizational information and individual privacy.',
            'The use of automated tools helps to increase the effectiveness and efficiency of the information location capability implemented within the system. Automation also helps organizations manage the data produced during information location activities and share such information across the organization. The output of automated information location tools can be used to guide and inform system architecture and design decisions.',
            'moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-13 Data Action Mapping',
                'Develop and document a map of system data actions.',
                'moderate',
                'Data actions are system operations that process personally identifiable information. The processing of such information encompasses the full information life cycle, which includes collection, generation, transformation, use, disclosure, retention, and disposal. A map of system data actions includes discrete data actions, elements of personally identifiable information being processed in the data actions, system components involved in the data actions, and the owners or operators of the system components. Understanding what personally identifiable information is being processed (e.g., the sensitivity of the personally identifiable information), how personally identifiable information is being processed (e.g., if the data action is visible to the individual or is processed in another part of the system), and by whom (e.g., individuals may have different privacy perceptions based on the entity that is processing the personally identifiable information) provides a number of contextual factors that are important to assessing the degree of privacy risk created by the system. Data maps can be illustrated in different ways, and the level of detail may vary based on the mission and business needs of the organization. The data map may be an overlay of any system design artifact that the organization is using. The development of this map may necessitate coordination between the privacy and security programs regarding the covered data actions and the components that are identified as part of the system.',
                64
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'CM-14 Signed Components',
                'Prevent the installation of [Assignment: organization-defined software and firmware components] without verification that the component has been digitally signed using a certificate that is recognized and approved by the organization.',
                'moderate',
                'Software and firmware components prevented from installation unless signed with recognized and approved certificates include software and firmware version updates, patches, service packs, device drivers, and basic input/output system updates. Organizations can identify applicable software and firmware components by type, by specific items, or a combination of both. Digital signatures and organizational verification of such signatures is a method of code authentication.',
                65
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Configuration Management';

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
