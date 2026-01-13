import { MigrationInterface, QueryRunner } from "typeorm";

export class AddControlForAccessControlNIST1729764547391 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`TRUNCATE TABLE standard_controls;`);
        queryRunner.query(`TRUNCATE TABLE standard_control_enhancements;`);

        const categoryName = 'Access Control';

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-1 Policy And Procedures',
                'Review and update the current access control:',
                'low,moderate,high',
                'Access control policy and procedures address the controls in the AC family that are implemented within systems and organizations. The risk management strategy is an important factor in establishing such policies and procedures. Policies and procedures contribute to security and privacy assurance. Therefore, it is important that security and privacy programs collaborate on the development of access control policy and procedures. Security and privacy program policies and procedures at the organization level are preferable, in general, and may obviate the need for mission- or system-specific policies and procedures. The policy can be included as part of the general security and privacy policy or be represented by multiple policies reflecting the complex nature of organizations. Procedures can be established for security and privacy programs, for mission or business processes, and for systems, if needed. Procedures describe how the policies or controls are implemented and can be directed at the individual or role that is the object of the procedure. Procedures can be documented in system security and privacy plans or in one or more separate documents. Events that may precipitate an update to access control policy and procedures include assessment or audit findings, security incidents or breaches, or changes in laws, executive orders, directives, regulations, policies, standards, and guidelines. Simply restating controls does not constitute an organizational policy or procedure.',
                1
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-2 Account Management',
                'Align account management processes with personnel termination and transfer processes.',
                'low,moderate,high',
                'Temporary and emergency accounts are intended for short-term use. Organizations establish temporary accounts as part of normal account activation procedures when there is a need for short-term accounts without the demand for immediacy in account activation. Organizations establish emergency accounts in response to crisis situations and with the need for rapid account activation. Therefore, emergency account activation may bypass normal account authorization processes. Emergency and temporary accounts are not to be confused with infrequently used accounts, including local logon accounts used for special tasks or when network resources are unavailable (may also be known as accounts of last resort). Such accounts remain available and are not subject to automatic disabling or removal dates. Conditions for disabling or deactivating accounts include when shared/group, emergency, or temporary accounts are no longer required and when individuals are transferred or terminated. Changing shared/group authenticators when members leave the group is intended to ensure that former group members do not retain access to the shared or group account. Some types of system accounts may require specialized training.',
                2
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-2(1) Automated System Account Management',
            'Support the management of system accounts using [Assignment: organization-defined automated mechanisms].',
            'Automated system account management includes using automated mechanisms to create, enable, modify, disable, and remove accounts; notify account managers when an account is created, enabled, modified, disabled, or removed, or when users are terminated or transferred; monitor system account usage; and report atypical system account usage. Automated mechanisms can include internal system functions and email, telephonic, and text messaging notifications.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-2(2) Automated Temporary And Emergency Account Management',
            'Automatically [Selection: remove; disable] temporary and emergency accounts after [Assignment: organization-defined time period for each type of account].',
            'Management of temporary and emergency accounts includes the removal or disabling of such accounts automatically after a predefined time period rather than at the convenience of the system administrator. Automatic removal or disabling of accounts provides a more consistent implementation.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-2(3) Disable Accounts',
            'Disable accounts within [Assignment: organization-defined time period] when the accounts:',
            'Disabling expired, inactive, or otherwise anomalous accounts supports the concepts of least privilege and least functionality which reduce the attack surface of the system.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-2(4) Automated Audit Actions',
            'Automatically audit account creation, modification, enabling, disabling, and removal actions.',
            'Account management audit records are defined in accordance with &lt;a href=&#34;#au-2&#34;&gt;AU-2&lt;/a&gt; and reviewed, analyzed, and reported in accordance with &lt;a href=&#34;#au-6&#34;&gt;AU-6&lt;/a&gt;.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-2(5) Inactivity Logout',
            'Require that users log out when [Assignment: organization-defined time period of expected inactivity or description of when to log out].',
            'Inactivity logout is behavior- or policy-based and requires users to take physical action to log out when they are expecting inactivity longer than the defined period. Automatic enforcement of inactivity logout is addressed by &lt;a href=&#34;#ac-11&#34;&gt;AC-11&lt;/a&gt;.',
            'low,moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-2(6) Dynamic Privilege Management',
            'Implement [Assignment: organization-defined dynamic privilege management capabilities].',
            'In contrast to access control approaches that employ static accounts and predefined user privileges, dynamic access control approaches rely on runtime access control decisions facilitated by dynamic privilege management, such as attribute-based access control. While user identities remain relatively constant over time, user privileges typically change more frequently based on ongoing mission or business requirements and the operational needs of organizations. An example of dynamic privilege management is the immediate revocation of privileges from users as opposed to requiring that users terminate and restart their sessions to reflect changes in privileges. Dynamic privilege management can also include mechanisms that change user privileges based on dynamic rules as opposed to editing specific user profiles. Examples include automatic adjustments of user privileges if they are operating out of their normal work times, if their job function or assignment changes, or if systems are under duress or in emergency situations. Dynamic privilege management includes the effects of privilege changes, for example, when there are changes to encryption keys used for communications.',
            'low,moderate,high',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-2(7) Privileged User Accounts',
            'Establish and administer privileged user accounts in accordance with [Selection: a role-based access scheme; an attribute-based access scheme]; Monitor privileged role or attribute assignments; Monitor changes to roles or attributes; and Revoke access when privileged role or attribute assignments are no longer appropriate.',
            'Privileged roles are organization-defined roles assigned to individuals that allow those individuals to perform certain security-relevant functions that ordinary users are not authorized to perform. Privileged roles include key management, account management, database administration, system and network administration, and web administration. A role-based access scheme organizes permitted system access and privileges into roles. In contrast, an attribute-based access scheme specifies allowed system access and privileges based on attributes.',
            'low,moderate,high',
            7
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-2(8) Dynamic Account Management',
            'Create, activate, manage, and deactivate [Assignment: organization-defined system accounts] dynamically.',
            'Approaches for dynamically creating, activating, managing, and deactivating system accounts rely on automatically provisioning the accounts at runtime for entities that were previously unknown. Organizations plan for the dynamic management, creation, activation, and deactivation of system accounts by establishing trust relationships, business rules, and mechanisms with appropriate authorities to validate related authorizations and privileges.',
            'low,moderate,high',
            8
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-2(9) Restrictions On Use Of Shared And Group Accounts',
            'Only permit the use of shared and group accounts that meet [Assignment: organization-defined conditions for establishing shared and group accounts].',
            'Before permitting the use of shared or group accounts, organizations consider the increased risk due to the lack of accountability with such accounts.',
            'low,moderate,high',
            9
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-2(11) Usage Conditions',
            'Enforce [Assignment: organization-defined circumstances and/or usage conditions] for  [Assignment: organization-defined system accounts].',
            'Specifying and enforcing usage conditions helps to enforce the principle of least privilege, increase user accountability, and enable effective account monitoring. Account monitoring includes alerts generated if the account is used in violation of organizational parameters. Organizations can describe specific conditions or circumstances under which system accounts can be used, such as by restricting usage to certain days of the week, time of day, or specific durations of time.',
            'low,moderate,high',
            10
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-2(12) Account Monitoring For Atypical Usage',
            'Monitor system accounts for [Assignment: organization-defined atypical usage]; and Report atypical usage of system accounts to [Assignment: organization-defined personnel or roles].',
            'Atypical usage includes accessing systems at certain times of the day or from locations that are not consistent with the normal usage patterns of individuals. Monitoring for atypical usage may reveal rogue behavior by individuals or an attack in progress. Account monitoring may inadvertently create privacy risks since data collected to identify atypical usage may reveal previously unknown information about the behavior of individuals. Organizations assess and document privacy risks from monitoring accounts for atypical usage in their privacy impact assessment and make determinations that are in alignment with their privacy program plan.',
            'low,moderate,high',
            11
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-2(13) Disable Accounts For High-risk Individuals',
            'Disable accounts of individuals within [Assignment: organization-defined time period] of discovery of [Assignment: organization-defined significant risks].',
            'Users who pose a significant security and/or privacy risk include individuals for whom reliable evidence indicates either the intention to use authorized access to systems to cause harm or through whom adversaries will cause harm. Such harm includes adverse impacts to organizational operations, organizational assets, individuals, other organizations, or the Nation. Close coordination among system administrators, legal staff, human resource managers, and authorizing officials is essential when disabling system accounts for high-risk individuals.',
            'low,moderate,high',
            12
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-3 Access Enforcement',
                'Enforce approved authorizations for logical access to information and system resources in accordance with applicable access control policies.',
                'low,moderate,high',
                'Access control policies control access between active entities or subjects (i.e., users or processes acting on behalf of users) and passive entities or objects (i.e., devices, files, records, domains) in organizational systems. In addition to enforcing authorized access at the system level and recognizing that systems can host many applications and services in support of mission and business functions, access enforcement mechanisms can also be employed at the application and service level to provide increased information security and privacy. In contrast to logical access controls that are implemented within the system, physical access controls are addressed by the controls in the Physical and Environmental Protection (&lt;a href=&#34;#pe&#34;&gt;PE&lt;/a&gt;) family.',
                3
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-3(2) Dual Authorization',
            'Enforce dual authorization for [Assignment: organization-defined privileged commands and/or other organization-defined actions].',
            'Dual authorization, also known as two-person control, reduces risk related to insider threats. Dual authorization mechanisms require the approval of two authorized individuals to execute. To reduce the risk of collusion, organizations consider rotating dual authorization duties. Organizations consider the risk associated with implementing dual authorization mechanisms when immediate responses are necessary to ensure public and environmental safety.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(3) Mandatory Access Control',
            'Enforce [Assignment: organization-defined mandatory access control policy] over the set of covered subjects and objects specified in the policy, and where the policy:',
            'The trusted subjects described above are granted privileges consistent with the concept of least privilege (see &lt;a href=&#34;#ac-6&#34;&gt;AC-6&lt;/a&gt;). Trusted subjects are only given the minimum privileges necessary for satisfying organizational mission/business needs relative to the above policy. The control is most applicable when there is a mandate that establishes a policy regarding access to controlled unclassified information or classified information and some users of the system are not authorized access to all such information resident in the system. Mandatory access control can operate in conjunction with discretionary access control as described in &lt;a href=&#34;#ac-3.4&#34;&gt;AC-3(4)&lt;/a&gt;. A subject constrained in its operation by mandatory access control policies can still operate under the less rigorous constraints of AC-3(4), but mandatory access control policies take precedence over the less rigorous constraints of AC-3(4). For example, while a mandatory access control policy imposes a constraint that prevents a subject from passing information to another subject operating at a different impact or classification level, AC-3(4) permits the subject to pass the information to any other subject with the same impact or classification level as the subject. Examples of mandatory access control policies include the Bell-LaPadula policy to protect confidentiality of information and the Biba policy to protect the integrity of information.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(4) Discretionary Access Control',
            'Enforce [Assignment: organization-defined discretionary access control policy] over the set of covered subjects and objects specified in the policy, and where the policy specifies that a subject that has been granted access to information can do one or more of the following:',
            'When discretionary access control policies are implemented, subjects are not constrained with regard to what actions they can take with information for which they have already been granted access. Thus, subjects that have been granted access to information are not prevented from passing the information to other subjects or objects (i.e., subjects have the discretion to pass). Discretionary access control can operate in conjunction with mandatory access control as described in &lt;a href=&#34;#ac-3.3&#34;&gt;AC-3(3)&lt;/a&gt; and &lt;a href=&#34;#ac-3.15&#34;&gt;AC-3(15)&lt;/a&gt;. A subject that is constrained in its operation by mandatory access control policies can still operate under the less rigorous constraints of discretionary access control. Therefore, while &lt;a href=&#34;#ac-3.3&#34;&gt;AC-3(3)&lt;/a&gt; imposes constraints that prevent a subject from passing information to another subject operating at a different impact or classification level, &lt;a href=&#34;#ac-3.4&#34;&gt;AC-3(4)&lt;/a&gt; permits the subject to pass the information to any subject at the same impact or classification level. The policy is bounded by the system. Once the information is passed outside of system control, additional means may be required to ensure that the constraints remain in effect. While traditional definitions of discretionary access control require identity-based access control, that limitation is not required for this particular use of discretionary access control.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(5) Security-relevant Information',
            'Prevent access to [Assignment: organization-defined security-relevant information] except during secure, non-operable system states.',
            'Security-relevant information is information within systems that can potentially impact the operation of security functions or the provision of security services in a manner that could result in failure to enforce system security and privacy policies or maintain the separation of code and data. Security-relevant information includes access control lists, filtering rules for routers or firewalls, configuration parameters for security services, and cryptographic key management information. Secure, non-operable system states include the times in which systems are not performing mission or business-related processing, such as when the system is offline for maintenance, boot-up, troubleshooting, or shut down.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(7) Role-based Access Control',
            'Enforce a role-based access control policy over defined subjects and objects and control access based upon [Assignment: organization-defined roles and users authorized to assume such roles].',
            'Role-based access control (RBAC) is an access control policy that enforces access to objects and system functions based on the defined role (i.e., job function) of the subject. Organizations can create specific roles based on job functions and the authorizations (i.e., privileges) to perform needed operations on the systems associated with the organization-defined roles. When users are assigned to specific roles, they inherit the authorizations or privileges defined for those roles. RBAC simplifies privilege administration for organizations because privileges are not assigned directly to every user (which can be a large number of individuals) but are instead acquired through role assignments. RBAC can also increase privacy and security risk if individuals assigned to a role are given access to information beyond what they need to support organizational missions or business functions. RBAC can be implemented as a mandatory or discretionary form of access control. For organizations implementing RBAC with mandatory access controls, the requirements in &lt;a href=&#34;#ac-3.3&#34;&gt;AC-3(3)&lt;/a&gt; define the scope of the subjects and objects covered by the policy.',
            'low,moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(8) Revocation Of Access Authorizations',
            'Enforce the revocation of access authorizations resulting from changes to the security attributes of subjects and objects based on [Assignment: organization-defined rules governing the timing of revocations of access authorizations].',
            'Revocation of access rules may differ based on the types of access revoked. For example, if a subject (i.e., user or process acting on behalf of a user) is removed from a group, access may not be revoked until the next time the object is opened or the next time the subject attempts to access the object. Revocation based on changes to security labels may take effect immediately. Organizations provide alternative approaches on how to make revocations immediate if systems cannot provide such capability and immediate revocation is necessary.',
            'low,moderate,high',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(9) Controlled Release',
            'Release information outside of the system only if:',
            'Controlled release of information requires systems to implement technical or procedural means to validate the information prior to releasing it to external systems. For example, if the system passes information to a system controlled by another organization, technical means are employed to validate that the security and privacy attributes associated with the exported information are appropriate for the receiving system. Alternatively, if the system passes information to a printer in organization-controlled space, procedural means can be employed to ensure that only authorized individuals gain access to the printer.',
            'low,moderate,high',
            7
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(10) Audited Override Of Access Control Mechanisms',
            'Employ an audited override of automated access control mechanisms under [Assignment: organization-defined conditions] by [Assignment: organization-defined roles].',
            'In certain situations, such as when there is a threat to human life or an event that threatens the organization’s ability to carry out critical missions or business functions, an override capability for access control mechanisms may be needed. Override conditions are defined by organizations and used only in those limited circumstances. Audit events are defined in &lt;a href=&#34;#au-2&#34;&gt;AU-2&lt;/a&gt;. Audit records are generated in &lt;a href=&#34;#au-12&#34;&gt;AU-12&lt;/a&gt;.',
            'low,moderate,high',
            8
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(11) Restrict Access To Specific Information Types',
            'Restrict access to data repositories containing [Assignment: organization-defined information types].',
            'Restricting access to specific information is intended to provide flexibility regarding access control of specific information types within a system. For example, role-based access could be employed to allow access to only a specific type of personally identifiable information within a database rather than allowing access to the database in its entirety. Other examples include restricting access to cryptographic keys, authentication information, and selected system information.',
            'low,moderate,high',
            9
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(12) Assert And Enforce Application Access',
            'Require applications to assert, as part of the installation process, the access needed to the following system applications and functions: [Assignment: organization-defined system applications and functions]; Provide an enforcement mechanism to prevent unauthorized access; and Approve access changes after initial installation of the application.',
            'Asserting and enforcing application access is intended to address applications that need to access existing system applications and functions, including user contacts, global positioning systems, cameras, keyboards, microphones, networks, phones, or other files.',
            'low,moderate,high',
            10
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(13) Attribute-based Access Control',
            'Enforce attribute-based access control policy over defined subjects and objects and control access based upon [Assignment: organization-defined attributes to assume access permissions].',
            'Attribute-based access control is an access control policy that restricts system access to authorized users based on specified organizational attributes (e.g., job function, identity), action attributes (e.g., read, write, delete), environmental attributes (e.g., time of day, location), and resource attributes (e.g., classification of a document). Organizations can create rules based on attributes and the authorizations (i.e., privileges) to perform needed operations on the systems associated with organization-defined attributes and rules. When users are assigned to attributes defined in attribute-based access control policies or rules, they can be provisioned to a system with the appropriate privileges or dynamically granted access to a protected resource. Attribute-based access control can be implemented as either a mandatory or discretionary form of access control. When implemented with mandatory access controls, the requirements in &lt;a href=&#34;#ac-3.3&#34;&gt;AC-3(3)&lt;/a&gt; define the scope of the subjects and objects covered by the policy.',
            'low,moderate,high',
            11
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(14) Individual Access',
            'Provide [Assignment: organization-defined mechanisms] to enable individuals to have access to the following elements of their personally identifiable information: [Assignment: organization-defined elements].',
            'Individual access affords individuals the ability to review personally identifiable information about them held within organizational records, regardless of format. Access helps individuals to develop an understanding about how their personally identifiable information is being processed. It can also help individuals ensure that their data is accurate. Access mechanisms can include request forms and application interfaces. For federal agencies, &lt;a href=&#34;https://www.govinfo.gov/content/pkg/STATUTE-88/pdf/STATUTE-88-Pg1896.pdf&#34;&gt;PRIVACT&lt;/a&gt; processes can be located in systems of record notices and on agency websites. Access to certain types of records may not be appropriate (e.g., for federal agencies, law enforcement records within a system of records may be exempt from disclosure under the &lt;a href=&#34;https://www.govinfo.gov/content/pkg/STATUTE-88/pdf/STATUTE-88-Pg1896.pdf&#34;&gt;PRIVACT&lt;/a&gt;) or may require certain levels of authentication assurance. Organizational personnel consult with the senior agency official for privacy and legal counsel to determine appropriate mechanisms and access rights or limitations.',
            'low,moderate,high',
            12
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-3(15) Discretionary And Mandatory Access Control',
            'Enforce [Assignment: organization-defined mandatory access control policy] over the set of covered subjects and objects specified in the policy; and Enforce [Assignment: organization-defined discretionary access control policy] over the set of covered subjects and objects specified in the policy.',
            'Simultaneously implementing a mandatory access control policy and a discretionary access control policy can provide additional protection against the unauthorized execution of code by users or processes acting on behalf of users. This helps prevent a single compromised user or process from compromising the entire system.',
            'low,moderate,high',
            13
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-4 Information Flow Enforcement',
                'Enforce approved authorizations for controlling the flow of information within the system and between connected systems based on [Assignment: organization-defined information flow control policies].',
                'moderate,high',
                'Organizations commonly employ information flow control policies and enforcement mechanisms to control the flow of information between designated sources and destinations within systems and between connected systems. Flow control is based on the characteristics of the information and/or the information path. Enforcement occurs, for example, in boundary protection devices that employ rule sets or establish configuration settings that restrict system services, provide a packet-filtering capability based on header information, or provide a message-filtering capability based on message content. Organizations also consider the trustworthiness of filtering and/or inspection mechanisms (i.e., hardware, firmware, and software components) that are critical to information flow enforcement. Control enhancements 3 through 32 primarily address cross-domain solution needs that focus on more advanced filtering techniques, in-depth analysis, and stronger flow enforcement mechanisms implemented in cross-domain products, such as high-assurance guards. Such capabilities are generally not available in commercial off-the-shelf products. Information flow enforcement also applies to control plane traffic (e.g., routing and DNS).',
                4
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-4(1) Object Security And Privacy Attributes',
            'Use [Assignment: organization-defined security and privacy attributes] associated with [Assignment: organization-defined information, source, and destination objects] to enforce [Assignment: organization-defined information flow control policies] as a basis for flow control decisions.',
            'Information flow enforcement mechanisms compare security and privacy attributes associated with information (i.e., data content and structure) and source and destination objects and respond appropriately when the enforcement mechanisms encounter information flows not explicitly allowed by information flow policies. For example, an information object labeled Secret would be allowed to flow to a destination object labeled Secret, but an information object labeled Top Secret would not be allowed to flow to a destination object labeled Secret. A dataset of personally identifiable information may be tagged with restrictions against combining with other types of datasets and, thus, would not be allowed to flow to the restricted dataset. Security and privacy attributes can also include source and destination addresses employed in traffic filter firewalls. Flow enforcement using explicit security or privacy attributes can be used, for example, to control the release of certain types of information.',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(2) Processing Domains',
            'Use protected processing domains to enforce [Assignment: organization-defined information flow control policies] as a basis for flow control decisions.',
            'Protected processing domains within systems are processing spaces that have controlled interactions with other processing spaces, enabling control of information flows between these spaces and to/from information objects. A protected processing domain can be provided, for example, by implementing domain and type enforcement. In domain and type enforcement, system processes are assigned to domains, information is identified by types, and information flows are controlled based on allowed information accesses (i.e., determined by domain and type), allowed signaling among domains, and allowed process transitions to other domains.',
            'moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(3) Dynamic Information Flow Control',
            'Enforce [Assignment: organization-defined information flow control policies].',
            'Organizational policies regarding dynamic information flow control include allowing or disallowing information flows based on changing conditions or mission or operational considerations. Changing conditions include changes in risk tolerance due to changes in the immediacy of mission or business needs, changes in the threat environment, and detection of potentially harmful or adverse events.',
            'moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(4) Flow Control Of Encrypted Information',
            'Prevent encrypted information from bypassing [Assignment: organization-defined information flow control mechanisms] by [Selection (one or more): decrypting the information; blocking the flow of the encrypted information; terminating communications sessions attempting to pass encrypted information; [Assignment: organization-defined procedure or method]].',
            'Flow control mechanisms include content checking, security policy filters, and data type identifiers. The term encryption is extended to cover encoded data not recognized by filtering mechanisms.',
            'moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(5) Embedded Data Types',
            'Enforce [Assignment: organization-defined limitations] on embedding data types within other data types.',
            'Embedding data types within other data types may result in reduced flow control effectiveness. Data type embedding includes inserting files as objects within other files and using compressed or archived data types that may include multiple embedded data types. Limitations on data type embedding consider the levels of embedding and prohibit levels of data type embedding that are beyond the capability of the inspection tools.',
            'moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(6) Metadata',
            'Enforce information flow control based on [Assignment: organization-defined metadata].',
            'Metadata is information that describes the characteristics of data. Metadata can include structural metadata describing data structures or descriptive metadata describing data content. Enforcement of allowed information flows based on metadata enables simpler and more effective flow control. Organizations consider the trustworthiness of metadata regarding data accuracy (i.e., knowledge that the metadata values are correct with respect to the data), data integrity (i.e., protecting against unauthorized changes to metadata tags), and the binding of metadata to the data payload (i.e., employing sufficiently strong binding techniques with appropriate assurance).',
            'moderate,high',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(7) One-way Flow Mechanisms',
            'Enforce one-way information flows through hardware-based flow control mechanisms.',
            'One-way flow mechanisms may also be referred to as a unidirectional network, unidirectional security gateway, or data diode. One-way flow mechanisms can be used to prevent data from being exported from a higher impact or classified domain or system while permitting data from a lower impact or unclassified domain or system to be imported.',
            'moderate,high',
            7
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(8) Security And Privacy Policy Filters',
            'Enforce information flow control using [Assignment: organization-defined security or privacy policy filters] as a basis for flow control decisions for [Assignment: organization-defined information flows]; and [Selection (one or more): Block; Strip; Modify; Quarantine] data after a filter processing failure in accordance with [Assignment: organization-defined security or privacy policy].',
            'Organization-defined security or privacy policy filters can address data structures and content. For example, security or privacy policy filters for data structures can check for maximum file lengths, maximum field sizes, and data/file types (for structured and unstructured data). Security or privacy policy filters for data content can check for specific words, enumerated values or data value ranges, and hidden content. Structured data permits the interpretation of data content by applications. Unstructured data refers to digital information without a data structure or with a data structure that does not facilitate the development of rule sets to address the impact or classification level of the information conveyed by the data or the flow enforcement decisions. Unstructured data consists of bitmap objects that are inherently non-language-based (i.e., image, video, or audio files) and textual objects that are based on written or printed languages. Organizations can implement more than one security or privacy policy filter to meet information flow control objectives.',
            'moderate,high',
            8
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(9) Human Reviews',
            'Enforce the use of human reviews for [Assignment: organization-defined information flows] under the following conditions: [Assignment: organization-defined conditions].',
            'Organizations define security or privacy policy filters for all situations where automated flow control decisions are possible. When a fully automated flow control decision is not possible, then a human review may be employed in lieu of or as a complement to automated security or privacy policy filtering. Human reviews may also be employed as deemed necessary by organizations.',
            'moderate,high',
            9
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(10) Enable And Disable Security Or Privacy Policy Filters',
            'Provide the capability for privileged administrators to enable and disable [Assignment: organization-defined security or privacy policy filters] under the following conditions: [Assignment: organization-defined conditions].',
            'For example, as allowed by the system authorization, administrators can enable security or privacy policy filters to accommodate approved data types. Administrators also have the capability to select the filters that are executed on a specific data flow based on the type of data that is being transferred, the source and destination security domains, and other security or privacy relevant features, as needed.',
            'moderate,high',
            10
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(11) Configuration Of Security Or Privacy Policy Filters',
            'Provide the capability for privileged administrators to configure [Assignment: organization-defined security or privacy policy filters] to support different security or privacy policies.',
            'Documentation contains detailed information for configuring security or privacy policy filters. For example, administrators can configure security or privacy policy filters to include the list of inappropriate words that security or privacy policy mechanisms check in accordance with the definitions provided by organizations.',
            'moderate,high',
            11
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(12) Data Type Identifiers',
            'When transferring information between different security domains, use [Assignment: organization-defined data type identifiers] to validate data essential for information flow decisions.',
            'Data type identifiers include filenames, file types, file signatures or tokens, and multiple internal file signatures or tokens. Systems only allow transfer of data that is compliant with data type format specifications. Identification and validation of data types is based on defined specifications associated with each allowed data format. The filename and number alone are not used for data type identification. Content is validated syntactically and semantically against its specification to ensure that it is the proper data type.',
            'moderate,high',
            12
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(13) Decomposition Into Policy-relevant Subcomponents',
            'When transferring information between different security domains, decompose information into [Assignment: organization-defined policy-relevant subcomponents] for submission to policy enforcement mechanisms.',
            'Decomposing information into policy-relevant subcomponents prior to information transfer facilitates policy decisions on source, destination, certificates, classification, attachments, and other security- or privacy-related component differentiators. Policy enforcement mechanisms apply filtering, inspection, and/or sanitization rules to the policy-relevant subcomponents of information to facilitate flow enforcement prior to transferring such information to different security domains.',
            'moderate,high',
            13
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(14) Security Or Privacy Policy Filter Constraints',
            'When transferring information between different security domains, implement [Assignment: organization-defined security or privacy policy filters] requiring fully enumerated formats that restrict data structure and content.',
            'Data structure and content restrictions reduce the range of potential malicious or unsanctioned content in cross-domain transactions. Security or privacy policy filters that restrict data structures include restricting file sizes and field lengths. Data content policy filters include encoding formats for character sets, restricting character data fields to only contain alpha-numeric characters, prohibiting special characters, and validating schema structures.',
            'moderate,high',
            14
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(15) Detection Of Unsanctioned Information',
            'When transferring information between different security domains, examine the information for the presence of [Assignment: organization-defined unsanctioned information] and prohibit the transfer of such information in accordance with the [Assignment: organization-defined security or privacy policy].',
            'Unsanctioned information includes malicious code, information that is inappropriate for release from the source network, or executable code that could disrupt or harm the services or systems on the destination network.',
            'moderate,high',
            15
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(17) Domain Authentication',
            'Uniquely identify and authenticate source and destination points by [Selection (one or more): organization; system; application; service; individual] for information transfer.',
            'Attribution is a critical component of a security and privacy concept of operations. The ability to identify source and destination points for information flowing within systems allows the forensic reconstruction of events and encourages policy compliance by attributing policy violations to specific organizations or individuals. Successful domain authentication requires that system labels distinguish among systems, organizations, and individuals involved in preparing, sending, receiving, or disseminating information. Attribution also allows organizations to better maintain the lineage of personally identifiable information processing as it flows through systems and can facilitate consent tracking, as well as correction, deletion, or access requests from individuals.',
            'moderate,high',
            16
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(19) Validation Of Metadata',
            'When transferring information between different security domains, implement [Assignment: organization-defined security or privacy policy filters] on metadata.',
            'All information (including metadata and the data to which the metadata applies) is subject to filtering and inspection. Some organizations distinguish between metadata and data payloads (i.e., only the data to which the metadata is bound). Other organizations do not make such distinctions and consider metadata and the data to which the metadata applies to be part of the payload.',
            'moderate,high',
            17
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(20) Approved Solutions',
            'Employ [Assignment: organization-defined solutions in approved configurations] to control the flow of [Assignment: organization-defined information] across security domains.',
            'Organizations define approved solutions and configurations in cross-domain policies and guidance in accordance with the types of information flows across classification boundaries. The National Security Agency (NSA) National Cross Domain Strategy and Management Office provides a listing of approved cross-domain solutions. Contact &lt;a href=&#34;mailto:ncdsmo@nsa.gov&#34;&gt;ncdsmo@nsa.gov&lt;/a&gt; for more information.',
            'moderate,high',
            18
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(21) Physical Or Logical Separation Of Information Flows',
            'Separate information flows logically or physically using [Assignment: organization-defined mechanisms and/or techniques] to accomplish [Assignment: organization-defined required separations by types of information].',
            'Enforcing the separation of information flows associated with defined types of data can enhance protection by ensuring that information is not commingled while in transit and by enabling flow control by transmission paths that are not otherwise achievable. Types of separable information include inbound and outbound communications traffic, service requests and responses, and information of differing security impact or classification levels.',
            'moderate,high',
            19
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(22) Access Only',
            'Provide access from a single device to computing platforms, applications, or data residing in multiple different security domains, while preventing information flow between the different security domains.',
            'The system provides a capability for users to access each connected security domain without providing any mechanisms to allow users to transfer data or information between the different security domains. An example of an access-only solution is a terminal that provides a user access to information with different security classifications while assuredly keeping the information separate.',
            'moderate,high',
            20
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(23) Modify Non-releasable Information',
            'When transferring information between different security domains, modify non-releasable information by implementing [Assignment: organization-defined modification action].',
            'Modifying non-releasable information can help prevent a data spill or attack when information is transferred across security domains. Modification actions include masking, permutation, alteration, removal, or redaction.',
            'moderate,high',
            21
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(24) Internal Normalized Format',
            'When transferring information between different security domains, parse incoming data into an internal normalized format and regenerate the data to be consistent with its intended specification.',
            'Converting data into normalized forms is one of most of effective mechanisms to stop malicious attacks and large classes of data exfiltration.',
            'moderate,high',
            22
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(25) Data Sanitization',
            'When transferring information between different security domains, sanitize data to minimize [Selection (one or more): delivery of malicious content, command and control of malicious code, malicious code augmentation, and steganography encoded data; spillage of sensitive information] in accordance with [Assignment: organization-defined policy].',
            'Data sanitization is the process of irreversibly removing or destroying data stored on a memory device (e.g., hard drives, flash memory/solid state drives, mobile devices, CDs, and DVDs) or in hard copy form.',
            'moderate,high',
            23
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(26) Audit Filtering Actions',
            'When transferring information between different security domains, record and audit content filtering actions and results for the information being filtered.',
            'Content filtering is the process of inspecting information as it traverses a cross-domain solution and determines if the information meets a predefined policy. Content filtering actions and the results of filtering actions are recorded for individual messages to ensure that the correct filter actions were applied. Content filter reports are used to assist in troubleshooting actions by, for example, determining why message content was modified and/or why it failed the filtering process. Audit events are defined in &lt;a href=&#34;#au-2&#34;&gt;AU-2&lt;/a&gt;. Audit records are generated in &lt;a href=&#34;#au-12&#34;&gt;AU-12&lt;/a&gt;.',
            'moderate,high',
            24
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(27) Redundant/independent Filtering Mechanisms',
            'When transferring information between different security domains, implement content filtering solutions that provide redundant and independent filtering mechanisms for each data type.',
            'Content filtering is the process of inspecting information as it traverses a cross-domain solution and determines if the information meets a predefined policy. Redundant and independent content filtering eliminates a single point of failure filtering system. Independence is defined as the implementation of a content filter that uses a different code base and supporting libraries (e.g., two JPEG filters using different vendors’ JPEG libraries) and multiple, independent system processes.',
            'moderate,high',
            25
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(28) Linear Filter Pipelines',
            'When transferring information between different security domains, implement a linear content filter pipeline that is enforced with discretionary and mandatory access controls.',
            'Content filtering is the process of inspecting information as it traverses a cross-domain solution and determines if the information meets a predefined policy. The use of linear content filter pipelines ensures that filter processes are non-bypassable and always invoked. In general, the use of parallel filtering architectures for content filtering of a single data type introduces bypass and non-invocation issues.',
            'moderate,high',
            26
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(29) Filter Orchestration Engines',
            'When transferring information between different security domains, employ content filter orchestration engines to ensure that:',
            'Content filtering is the process of inspecting information as it traverses a cross-domain solution and determines if the information meets a predefined security policy. An orchestration engine coordinates the sequencing of activities (manual and automated) in a content filtering process. Errors are defined as either anomalous actions or unexpected termination of the content filter process. This is not the same as a filter failing content due to non-compliance with policy. Content filter reports are a commonly used mechanism to ensure that expected filtering actions are completed successfully.',
            'moderate,high',
            27
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(30) Filter Mechanisms Using Multiple Processes',
            'When transferring information between different security domains, implement content filtering mechanisms using multiple processes.',
            'The use of multiple processes to implement content filtering mechanisms reduces the likelihood of a single point of failure.',
            'moderate,high',
            28
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(31) Failed Content Transfer Prevention',
            'When transferring information between different security domains, prevent the transfer of failed content to the receiving domain.',
            'Content that failed filtering checks can corrupt the system if transferred to the receiving domain.',
            'moderate,high',
            29
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-4(32) Process Requirements For Information Transfer',
            'When transferring information between different security domains, the process that transfers information between filter pipelines:',
            'The processes transferring information between filter pipelines have minimum complexity and functionality to provide assurance that the processes operate correctly.',
            'moderate,high',
            30
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-5 Separation Of Duties',
                'Define system access authorizations to support separation of duties.',
                'moderate,high',
                'Separation of duties addresses the potential for abuse of authorized privileges and helps to reduce the risk of malevolent activity without collusion. Separation of duties includes dividing mission or business functions and support functions among different individuals or roles, conducting system support functions with different individuals, and ensuring that security personnel who administer access control functions do not also administer audit functions. Because separation of duty violations can span systems and application domains, organizations consider the entirety of systems and system components when developing policy on separation of duties. Separation of duties is enforced through the account management activities in &lt;a href=&#34;#ac-2&#34;&gt;AC-2&lt;/a&gt;, access control mechanisms in &lt;a href=&#34;#ac-3&#34;&gt;AC-3&lt;/a&gt;, and identity management activities in &lt;a href=&#34;#ia-2&#34;&gt;IA-2&lt;/a&gt;, &lt;a href=&#34;#ia-4&#34;&gt;IA-4&lt;/a&gt;, and &lt;a href=&#34;#ia-12&#34;&gt;IA-12&lt;/a&gt;.',
                5
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-6 Least Privilege',
                'Employ the principle of least privilege, allowing only authorized accesses for users (or processes acting on behalf of users) that are necessary to accomplish assigned organizational tasks.',
                'moderate,high',
                'Organizations employ least privilege for specific duties and systems. The principle of least privilege is also applied to system processes, ensuring that the processes have access to systems and operate at privilege levels no higher than necessary to accomplish organizational missions or business functions. Organizations consider the creation of additional processes, roles, and accounts as necessary to achieve least privilege. Organizations apply least privilege to the development, implementation, and operation of organizational systems.',
                6
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-6(1) Authorize Access To Security Functions',
            'Authorize access for [Assignment: organization-defined individuals or roles] to:',
            'Security functions include establishing system accounts, configuring access authorizations (i.e., permissions, privileges), configuring settings for events to be audited, and establishing intrusion detection parameters. Security-relevant information includes filtering rules for routers or firewalls, configuration parameters for security services, cryptographic key management information, and access control lists. Authorized personnel include security administrators, system administrators, system security officers, system programmers, and other privileged users.',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-6(2) Non-privileged Access For Nonsecurity Functions',
            'Require that users of system accounts (or roles) with access to [Assignment: organization-defined security functions or security-relevant information] use non-privileged accounts or roles, when accessing nonsecurity functions.',
            'Requiring the use of non-privileged accounts when accessing nonsecurity functions limits exposure when operating from within privileged accounts or roles. The inclusion of roles addresses situations where organizations implement access control policies, such as role-based access control, and where a change of role provides the same degree of assurance in the change of access authorizations for the user and the processes acting on behalf of the user as would be provided by a change between a privileged and non-privileged account.',
            'moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-6(3) Network Access To Privileged Commands',
            'Authorize network access to [Assignment: organization-defined privileged commands] only for [Assignment: organization-defined compelling operational needs] and document the rationale for such access in the security plan for the system.',
            'Network access is any access across a network connection in lieu of local access (i.e., user being physically present at the device).',
            'moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-6(4) Separate Processing Domains',
            'Provide separate processing domains to enable finer-grained allocation of user privileges.',
            'Providing separate processing domains for finer-grained allocation of user privileges includes using virtualization techniques to permit additional user privileges within a virtual machine while restricting privileges to other virtual machines or to the underlying physical machine, implementing separate physical domains, and employing hardware or software domain separation mechanisms.',
            'moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-6(5) Privileged Accounts',
            'Restrict privileged accounts on the system to [Assignment: organization-defined personnel or roles].',
            'Privileged accounts, including super user accounts, are typically described as system administrator for various types of commercial off-the-shelf operating systems. Restricting privileged accounts to specific personnel or roles prevents day-to-day users from accessing privileged information or privileged functions. Organizations may differentiate in the application of restricting privileged accounts between allowed privileges for local accounts and for domain accounts provided that they retain the ability to control system configurations for key parameters and as otherwise necessary to sufficiently mitigate risk.',
            'moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-6(6) Privileged Access By Non-organizational Users',
            'Prohibit privileged access to the system by non-organizational users.',
            'An organizational user is an employee or an individual considered by the organization to have the equivalent status of an employee. Organizational users include contractors, guest researchers, or individuals detailed from other organizations. A non-organizational user is a user who is not an organizational user. Policies and procedures for granting equivalent status of employees to individuals include a need-to-know, citizenship, and the relationship to the organization.',
            'moderate,high',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-6(7) Review Of User Privileges',
            'Review [Assignment: organization-defined frequency] the privileges assigned to [Assignment: organization-defined roles or classes of users] to validate the need for such privileges; and Reassign or remove privileges, if necessary, to correctly reflect organizational mission and business needs.',
            'The need for certain assigned user privileges may change over time to reflect changes in organizational mission and business functions, environments of operation, technologies, or threats. A periodic review of assigned user privileges is necessary to determine if the rationale for assigning such privileges remains valid. If the need cannot be revalidated, organizations take appropriate corrective actions.',
            'moderate,high',
            7
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-6(8) Privilege Levels For Code Execution',
            'Prevent the following software from executing at higher privilege levels than users executing the software: [Assignment: organization-defined software].',
            'In certain situations, software applications or programs need to execute with elevated privileges to perform required functions. However, depending on the software functionality and configuration, if the privileges required for execution are at a higher level than the privileges assigned to organizational users invoking such applications or programs, those users may indirectly be provided with greater privileges than assigned.',
            'moderate,high',
            8
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-6(9) Log Use Of Privileged Functions',
            'Log the execution of privileged functions.',
            'The misuse of privileged functions, either intentionally or unintentionally by authorized users or by unauthorized external entities that have compromised system accounts, is a serious and ongoing concern and can have significant adverse impacts on organizations. Logging and analyzing the use of privileged functions is one way to detect such misuse and, in doing so, help mitigate the risk from insider threats and the advanced persistent threat.',
            'moderate,high',
            9
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-6(10) Prohibit Non-privileged Users From Executing Privileged Functions',
            'Prevent non-privileged users from executing privileged functions.',
            'Privileged functions include disabling, circumventing, or altering implemented security or privacy controls, establishing system accounts, performing system integrity checks, and administering cryptographic key management activities. Non-privileged users are individuals who do not possess appropriate authorizations. Privileged functions that require protection from non-privileged users include circumventing intrusion detection and prevention mechanisms or malicious code protection mechanisms. Preventing non-privileged users from executing privileged functions is enforced by &lt;a href=&#34;#ac-3&#34;&gt;AC-3&lt;/a&gt;.',
            'moderate,high',
            10
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-7 Unsuccessful Logon Attempts',
                'Automatically [Selection (one or more): lock the account or node for an [Assignment: organization-defined time period]; lock the account or node until released by an administrator; delay next logon prompt per [Assignment: organization-defined delay algorithm]; notify system administrator; take other [Assignment: organization-defined action]] when the maximum number of unsuccessful attempts is exceeded.',
                'low,moderate,high',
                'The need to limit unsuccessful logon attempts and take subsequent action when the maximum number of attempts is exceeded applies regardless of whether the logon occurs via a local or network connection. Due to the potential for denial of service, automatic lockouts initiated by systems are usually temporary and automatically release after a predetermined, organization-defined time period. If a delay algorithm is selected, organizations may employ different algorithms for different components of the system based on the capabilities of those components. Responses to unsuccessful logon attempts may be implemented at the operating system and the application levels. Organization-defined actions that may be taken when the number of allowed consecutive invalid logon attempts is exceeded include prompting the user to answer a secret question in addition to the username and password, invoking a lockdown mode with limited user capabilities (instead of full lockout), allowing users to only logon from specified Internet Protocol (IP) addresses, requiring a CAPTCHA to prevent automated attacks, or applying user profiles such as location, time of day, IP address, device, or Media Access Control (MAC) address. If automatic system lockout or execution of a delay algorithm is not implemented in support of the availability objective, organizations consider a combination of other actions to help prevent brute force attacks. In addition to the above, organizations can prompt users to respond to a secret question before the number of allowed unsuccessful logon attempts is exceeded. Automatically unlocking an account after a specified period of time is generally not permitted. However, exceptions may be required based on operational mission or need.',
                7
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-7(2) Purge Or Wipe Mobile Device',
            'Purge or wipe information from [Assignment: organization-defined mobile devices] based on [Assignment: organization-defined purging or wiping requirements and techniques] after [Assignment: organization-defined number] consecutive, unsuccessful device logon attempts.',
            'A mobile device is a computing device that has a small form factor such that it can be carried by a single individual; is designed to operate without a physical connection; possesses local, non-removable or removable data storage; and includes a self-contained power source. Purging or wiping the device applies only to mobile devices for which the organization-defined number of unsuccessful logons occurs. The logon is to the mobile device, not to any one account on the device. Successful logons to accounts on mobile devices reset the unsuccessful logon count to zero. Purging or wiping may be unnecessary if the information on the device is protected with sufficiently strong encryption mechanisms.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-7(3) Biometric Attempt Limiting',
            'Limit the number of unsuccessful biometric logon attempts to [Assignment: organization-defined number].',
            'Biometrics are probabilistic in nature. The ability to successfully authenticate can be impacted by many factors, including matching performance and presentation attack detection mechanisms. Organizations select the appropriate number of attempts for users based on organizationally-defined factors.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-7(4) Use Of Alternate Authentication Factor',
            'Allow the use of [Assignment: organization-defined authentication factors] that are different from the primary authentication factors after the number of organization-defined consecutive invalid logon attempts have been exceeded; and Enforce a limit of [Assignment: organization-defined number] consecutive invalid logon attempts through use of the alternative factors by a user during a [Assignment: organization-defined time period].',
            'The use of alternate authentication factors supports the objective of availability and allows a user who has inadvertently been locked out to use additional authentication factors to bypass the lockout.',
            'low,moderate,high',
            3
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-8 System Use Notification',
                'For publicly accessible systems:',
                'low,moderate,high',
                'System use notifications can be implemented using messages or warning banners displayed before individuals log in to systems. System use notifications are used only for access via logon interfaces with human users. Notifications are not required when human interfaces do not exist. Based on an assessment of risk, organizations consider whether or not a secondary system use notification is needed to access applications or other system resources after the initial network logon. Organizations consider system use notification messages or banners displayed in multiple languages based on organizational needs and the demographics of system users. Organizations consult with the privacy office for input regarding privacy messaging and the Office of the General Counsel or organizational equivalent for legal review and approval of warning banner content.',
                8
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-9 Previous Logon Notification',
                'Notify the user, upon successful logon to the system, of the date and time of the last logon.',
                'moderate',
                'Previous logon notification is applicable to system access via human user interfaces and access to systems that occurs in other types of architectures. Information about the last successful logon allows the user to recognize if the date and time provided is not consistent with the user’s last access.',
                9
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-9(1) Unsuccessful Logons',
            'Notify the user, upon successful logon, of the number of unsuccessful logon attempts since the last successful logon.',
            'Information about the number of unsuccessful logon attempts since the last successful logon allows the user to recognize if the number of unsuccessful logon attempts is consistent with the user’s actual logon attempts.',
            'moderate',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-9(2) Successful And Unsuccessful Logons',
            'Notify the user, upon successful logon, of the number of [Selection: successful logons; unsuccessful logon attempts; both] during [Assignment: organization-defined time period].',
            'Information about the number of successful and unsuccessful logon attempts within a specified time period allows the user to recognize if the number and type of logon attempts are consistent with the user’s actual logon attempts.',
            'moderate',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-9(3) Notification Of Account Changes',
            'Notify the user, upon successful logon, of changes to [Assignment: organization-defined security-related characteristics or parameters of the user’s account] during [Assignment: organization-defined time period].',
            'Information about changes to security-related account characteristics within a specified time period allows users to recognize if changes were made without their knowledge.',
            'moderate',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-9(4) Additional Logon Information',
            'Notify the user, upon successful logon, of the following additional information: [Assignment: organization-defined additional information].',
            'Organizations can specify additional information to be provided to users upon logon, including the location of the last logon. User location is defined as information that can be determined by systems, such as Internet Protocol (IP) addresses from which network logons occurred, notifications of local logons, or device identifiers.',
            'moderate',
            4
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-10 Concurrent Session Control',
                'Limit the number of concurrent sessions for each [Assignment: organization-defined account and/or account type] to [Assignment: organization-defined number].',
                'high',
                'Organizations may define the maximum number of concurrent sessions for system accounts globally, by account type, by account, or any combination thereof. For example, organizations may limit the number of concurrent sessions for system administrators or other individuals working in particularly sensitive domains or mission-critical applications. Concurrent session control addresses concurrent sessions for system accounts. It does not, however, address concurrent sessions by single users via multiple system accounts.',
                10
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-11 Device Lock',
                'Retain the device lock until the user reestablishes access using established identification and authentication procedures.',
                'moderate,high',
                'Device locks are temporary actions taken to prevent logical access to organizational systems when users stop work and move away from the immediate vicinity of those systems but do not want to log out because of the temporary nature of their absences. Device locks can be implemented at the operating system level or at the application level. A proximity lock may be used to initiate the device lock (e.g., via a Bluetooth-enabled device or dongle). User-initiated device locking is behavior or policy-based and, as such, requires users to take physical action to initiate the device lock. Device locks are not an acceptable substitute for logging out of systems, such as when organizations require users to log out at the end of workdays.',
                11
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-11(1) Pattern-hiding Displays',
            'Conceal, via the device lock, information previously visible on the display with a publicly viewable image.',
            'The pattern-hiding display can include static or dynamic images, such as patterns used with screen savers, photographic images, solid colors, clock, battery life indicator, or a blank screen with the caveat that controlled unclassified information is not displayed.',
            'moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-12 Session Termination',
                'Automatically terminate a user session after [Assignment: organization-defined conditions or trigger events requiring session disconnect].',
                'moderate,high',
                'Session termination addresses the termination of user-initiated logical sessions (in contrast to &lt;a href=&#34;#sc-10&#34;&gt;SC-10&lt;/a&gt;, which addresses the termination of network connections associated with communications sessions (i.e., network disconnect)). A logical session (for local, network, and remote access) is initiated whenever a user (or process acting on behalf of a user) accesses an organizational system. Such user sessions can be terminated without terminating network sessions. Session termination ends all processes associated with a user’s logical session except for those processes that are specifically created by the user (i.e., session owner) to continue after the session is terminated. Conditions or trigger events that require automatic termination of the session include organization-defined periods of user inactivity, targeted responses to certain types of incidents, or time-of-day restrictions on system use.',
                12
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-12(1) User-initiated Logouts',
            'Provide a logout capability for user-initiated communications sessions whenever authentication is used to gain access to [Assignment: organization-defined information resources].',
            'Information resources to which users gain access via authentication include local workstations, databases, and password-protected websites or web-based services.',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-12(2) Termination Message',
            'Display an explicit logout message to users indicating the termination of authenticated communications sessions.',
            'Logout messages for web access can be displayed after authenticated sessions have been terminated. However, for certain types of sessions, including file transfer protocol (FTP) sessions, systems typically send logout messages as final messages prior to terminating sessions.',
            'moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-12(3) Timeout Warning Message',
            'Display an explicit message to users indicating that the session will end in [Assignment: organization-defined time until end of session].',
            'To increase usability, notify users of pending session termination and prompt users to continue the session. The pending session termination time period is based on the parameters defined in the &lt;a href=&#34;#ac-12&#34;&gt;AC-12&lt;/a&gt; base control.',
            'moderate,high',
            3
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-14 Permitted Actions Without Identification Or Authentication',
                'Document and provide supporting rationale in the security plan for the system, user actions not requiring identification or authentication.',
                'low,moderate,high',
                'Specific user actions may be permitted without identification or authentication if organizations determine that identification and authentication are not required for the specified user actions. Organizations may allow a limited number of user actions without identification or authentication, including when individuals access public websites or other publicly accessible federal systems, when individuals use mobile phones to receive calls, or when facsimiles are received. Organizations identify actions that normally require identification or authentication but may, under certain circumstances, allow identification or authentication mechanisms to be bypassed. Such bypasses may occur, for example, via a software-readable physical switch that commands bypass of the logon functionality and is protected from accidental or unmonitored use. Permitting actions without identification or authentication does not apply to situations where identification and authentication have already occurred and are not repeated but rather to situations where identification and authentication have not yet occurred. Organizations may decide that there are no user actions that can be performed on organizational systems without identification and authentication, and therefore, the value for the assignment operation can be &lt;q&gt;none.&lt;/q&gt;',
                13
            )
            RETURNING id
        ) SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-16 Security And Privacy Attributes',
                'Review [Assignment: organization-defined security and privacy attributes] for applicability [Assignment: organization-defined frequency].',
                'moderate',
                'Organizations can define the types of attributes needed for systems to support missions or business functions. There are many values that can be assigned to a security attribute. By specifying the permitted attribute ranges and values, organizations ensure that attribute values are meaningful and relevant. Labeling refers to the association of attributes with the subjects and objects represented by the internal data structures within systems. This facilitates system-based enforcement of information security and privacy policies. Labels include classification of information in accordance with legal and compliance requirements (e.g., top secret, secret, confidential, controlled unclassified), information impact level; high value asset information, access authorizations, nationality; data life cycle protection (i.e., encryption and data expiration), personally identifiable information processing permissions, including individual consent to personally identifiable information processing, and contractor affiliation. A related term to labeling is marking. Marking refers to the association of attributes with objects in a human-readable form and displayed on system media. Marking enables manual, procedural, or process-based enforcement of information security and privacy policies. Security and privacy labels may have the same value as media markings (e.g., top secret, secret, confidential). See &lt;a href=&#34;#mp-3&#34;&gt;MP-3&lt;/a&gt; (Media Marking).',
                14
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-16(1) Dynamic Attribute Association',
            'Dynamically associate security and privacy attributes with [Assignment: organization-defined subjects and objects] in accordance with the following security and privacy policies as information is created and combined: [Assignment: organization-defined security and privacy policies].',
            'Dynamic association of attributes is appropriate whenever the security or privacy characteristics of information change over time. Attributes may change due to information aggregation issues (i.e., characteristics of individual data elements are different from the combined elements), changes in individual access authorizations (i.e., privileges), changes in the security category of information, or changes in security or privacy policies. Attributes may also change situationally.',
            'moderate',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-16(2) Attribute Value Changes By Authorized Individuals',
            'Provide authorized individuals (or processes acting on behalf of individuals) the capability to define or change the value of associated security and privacy attributes.',
            'The content or assigned values of attributes can directly affect the ability of individuals to access organizational information. Therefore, it is important for systems to be able to limit the ability to create or modify attributes to authorized individuals.',
            'moderate',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-16(3) Maintenance Of Attribute Associations By System',
            'Maintain the association and integrity of [Assignment: organization-defined security and privacy attributes] to [Assignment: organization-defined subjects and objects].',
            'Maintaining the association and integrity of security and privacy attributes to subjects and objects with sufficient assurance helps to ensure that the attribute associations can be used as the basis of automated policy actions. The integrity of specific items, such as security configuration files, may be maintained through the use of an integrity monitoring mechanism that detects anomalies and changes that deviate from &lt;q&gt;known good&lt;/q&gt; baselines. Automated policy actions include retention date expirations, access control decisions, information flow control decisions, and information disclosure decisions.',
            'moderate',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-16(4) Association Of Attributes By Authorized Individuals',
            'Provide the capability to associate [Assignment: organization-defined security and privacy attributes] with [Assignment: organization-defined subjects and objects] by authorized individuals (or processes acting on behalf of individuals).',
            'Systems, in general, provide the capability for privileged users to assign security and privacy attributes to system-defined subjects (e.g., users) and objects (e.g., directories, files, and ports). Some systems provide additional capability for general users to assign security and privacy attributes to additional objects (e.g., files, emails). The association of attributes by authorized individuals is described in the design documentation. The support provided by systems can include prompting users to select security and privacy attributes to be associated with information objects, employing automated mechanisms to categorize information with attributes based on defined policies, or ensuring that the combination of the security or privacy attributes selected is valid. Organizations consider the creation, deletion, or modification of attributes when defining auditable events.',
            'moderate',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-16(5) Attribute Displays On Objects To Be Output',
            'Display security and privacy attributes in human-readable form on each object that the system transmits to output devices to identify [Assignment: organization-defined special dissemination, handling, or distribution instructions] using [Assignment: organization-defined human-readable, standard naming conventions].',
            'System outputs include printed pages, screens, or equivalent items. System output devices include printers, notebook computers, video displays, smart phones, and tablets. To mitigate the risk of unauthorized exposure of information (e.g., shoulder surfing), the outputs display full attribute values when unmasked by the subscriber.',
            'moderate',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-16(6) Maintenance Of Attribute Association',
            'Require personnel to associate and maintain the association of [Assignment: organization-defined security and privacy attributes] with [Assignment: organization-defined subjects and objects] in accordance with [Assignment: organization-defined security and privacy policies].',
            'Maintaining attribute association requires individual users (as opposed to the system) to maintain associations of defined security and privacy attributes with subjects and objects.',
            'moderate',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-16(7) Consistent Attribute Interpretation',
            'Provide a consistent interpretation of security and privacy attributes transmitted between distributed system components.',
            'To enforce security and privacy policies across multiple system components in distributed systems, organizations provide a consistent interpretation of security and privacy attributes employed in access enforcement and flow enforcement decisions. Organizations can establish agreements and processes to help ensure that distributed system components implement attributes with consistent interpretations in automated access enforcement and flow enforcement actions.',
            'moderate',
            7
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-16(8) Association Techniques And Technologies',
            'Implement [Assignment: organization-defined techniques and technologies] in associating security and privacy attributes to information.',
            'The association of security and privacy attributes to information within systems is important for conducting automated access enforcement and flow enforcement actions. The association of such attributes to information (i.e., binding) can be accomplished with technologies and techniques that provide different levels of assurance. For example, systems can cryptographically bind attributes to information using digital signatures that support cryptographic keys protected by hardware devices (sometimes known as hardware roots of trust).',
            'moderate',
            8
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-16(9) Attribute Reassignment - Regrading Mechanisms',
            'Change security and privacy attributes associated with information only via regrading mechanisms validated using [Assignment: organization-defined techniques or procedures].',
            'A regrading mechanism is a trusted process authorized to re-classify and re-label data in accordance with a defined policy exception. Validated regrading mechanisms are used by organizations to provide the requisite levels of assurance for attribute reassignment activities. The validation is facilitated by ensuring that regrading mechanisms are single purpose and of limited function. Since security and privacy attribute changes can directly affect policy enforcement actions, implementing trustworthy regrading mechanisms is necessary to help ensure that such mechanisms perform in a consistent and correct mode of operation.',
            'moderate',
            9
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-16(10) Attribute Configuration By Authorized Individuals',
            'Provide authorized individuals the capability to define or change the type and value of security and privacy attributes available for association with subjects and objects.',
            'The content or assigned values of security and privacy attributes can directly affect the ability of individuals to access organizational information. Thus, it is important for systems to be able to limit the ability to create or modify the type and value of attributes available for association with subjects and objects to authorized individuals only.',
            'moderate',
            10
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-17 Remote Access',
                'Authorize each type of remote access to the system prior to allowing such connections.',
                'low,moderate,high',
                'Remote access is access to organizational systems (or processes acting on behalf of users) that communicate through external networks such as the Internet. Types of remote access include dial-up, broadband, and wireless. Organizations use encrypted virtual private networks (VPNs) to enhance confidentiality and integrity for remote connections. The use of encrypted VPNs provides sufficient assurance to the organization that it can effectively treat such connections as internal networks if the cryptographic mechanisms used are implemented in accordance with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines. Still, VPN connections traverse external networks, and the encrypted VPN does not enhance the availability of remote connections. VPNs with encrypted tunnels can also affect the ability to adequately monitor network communications traffic for malicious code. Remote access controls apply to systems other than public web servers or systems designed for public access. Authorization of each remote access type addresses authorization prior to allowing remote access without specifying the specific formats for such authorization. While organizations may use information exchange and system connection security agreements to manage remote access connections to other systems, such agreements are addressed as part of &lt;a href=&#34;#ca-3&#34;&gt;CA-3&lt;/a&gt;. Enforcing access restrictions for remote access is addressed via &lt;a href=&#34;#ac-3&#34;&gt;AC-3&lt;/a&gt;.',
                15
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-17(1) Monitoring And Control',
            'Employ automated mechanisms to monitor and control remote access methods.',
            'Monitoring and control of remote access methods allows organizations to detect attacks and help ensure compliance with remote access policies by auditing the connection activities of remote users on a variety of system components, including servers, notebook computers, workstations, smart phones, and tablets. Audit logging for remote access is enforced by &lt;a href=&#34;#au-2&#34;&gt;AU-2&lt;/a&gt;. Audit events are defined in &lt;a href=&#34;#au-2_smt.a&#34;&gt;AU-2a&lt;/a&gt;.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-17(2) Protection Of Confidentiality And Integrity Using Encryption',
            'Implement cryptographic mechanisms to protect the confidentiality and integrity of remote access sessions.',
            'Virtual private networks can be used to protect the confidentiality and integrity of remote access sessions. Transport Layer Security (TLS) is an example of a cryptographic protocol that provides end-to-end communications security over networks and is used for Internet communications and online transactions.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-17(3) Managed Access Control Points',
            'Route remote accesses through authorized and managed network access control points.',
            'Organizations consider the Trusted Internet Connections (TIC) initiative &lt;a href=&#34;https://www.dhs.gov/trusted-internet-connections&#34;&gt;DHS TIC&lt;/a&gt; requirements for external network connections since limiting the number of access control points for remote access reduces attack surfaces.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-17(4) Privileged Commands And Access',
            'Authorize the execution of privileged commands and access to security-relevant information via remote access only in a format that provides assessable evidence and for the following needs: [Assignment: organization-defined needs]; and Document the rationale for remote access in the security plan for the system.',
            'Remote access to systems represents a significant potential vulnerability that can be exploited by adversaries. As such, restricting the execution of privileged commands and access to security-relevant information via remote access reduces the exposure of the organization and the susceptibility to threats by adversaries to the remote access capability.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-17(6) Protection Of Mechanism Information',
            'Protect information about remote access mechanisms from unauthorized use and disclosure.',
            'Remote access to organizational information by non-organizational entities can increase the risk of unauthorized use and disclosure about remote access mechanisms. The organization considers including remote access requirements in the information exchange agreements with other organizations, as applicable. Remote access requirements can also be included in rules of behavior (see &lt;a href=&#34;#pl-4&#34;&gt;PL-4&lt;/a&gt;) and access agreements (see &lt;a href=&#34;#ps-6&#34;&gt;PS-6&lt;/a&gt;).',
            'low,moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-17(9) Disconnect Or Disable Access',
            'Provide the capability to disconnect or disable remote access to the system within [Assignment: organization-defined time period].',
            'The speed of system disconnect or disablement varies based on the criticality of missions or business functions and the need to eliminate immediate or future remote access to systems.',
            'low,moderate,high',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-17(10) Authenticate Remote Commands',
            'Implement [Assignment: organization-defined mechanisms] to authenticate [Assignment: organization-defined remote commands].',
            'Authenticating remote commands protects against unauthorized commands and the replay of authorized commands. The ability to authenticate remote commands is important for remote systems for which loss, malfunction, misdirection, or exploitation would have immediate or serious consequences, such as injury, death, property damage, loss of high value assets, failure of mission or business functions, or compromise of classified or controlled unclassified information. Authentication mechanisms for remote commands ensure that systems accept and execute commands in the order intended, execute only authorized commands, and reject unauthorized commands. Cryptographic mechanisms can be used, for example, to authenticate remote commands.',
            'low,moderate,high',
            7
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-18 Wireless Access',
                'Authorize each type of wireless access to the system prior to allowing such connections.',
                'low,moderate,high',
                'Wireless technologies include microwave, packet radio (ultra-high frequency or very high frequency), 802.11x, and Bluetooth. Wireless networks use authentication protocols that provide authenticator protection and mutual authentication.',
                16
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-18(1) Authentication And Encryption',
            'Protect wireless access to the system using authentication of [Selection (one or more): users; devices] and encryption.',
            'Wireless networking capabilities represent a significant potential vulnerability that can be exploited by adversaries. To protect systems with wireless access points, strong authentication of users and devices along with strong encryption can reduce susceptibility to threats by adversaries involving wireless technologies.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-18(3) Disable Wireless Networking',
            'Disable, when not intended for use, wireless networking capabilities embedded within system components prior to issuance and deployment.',
            'Wireless networking capabilities that are embedded within system components represent a significant potential vulnerability that can be exploited by adversaries. Disabling wireless capabilities when not needed for essential organizational missions or functions can reduce susceptibility to threats by adversaries involving wireless technologies.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-18(4) Restrict Configurations By Users',
            'Identify and explicitly authorize users allowed to independently configure wireless networking capabilities.',
            'Organizational authorizations to allow selected users to configure wireless networking capabilities are enforced, in part, by the access enforcement mechanisms employed within organizational systems.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-18(5) Antennas And Transmission Power Levels',
            'Select radio antennas and calibrate transmission power levels to reduce the probability that signals from wireless access points can be received outside of organization-controlled boundaries.',
            'Actions that may be taken to limit unauthorized use of wireless communications outside of organization-controlled boundaries include reducing the power of wireless transmissions so that the transmissions are less likely to emit a signal that can be captured outside of the physical perimeters of the organization, employing measures such as emissions security to control wireless emanations, and using directional or beamforming antennas that reduce the likelihood that unintended receivers will be able to intercept signals. Prior to taking such mitigating actions, organizations can conduct periodic wireless surveys to understand the radio frequency profile of organizational systems as well as other systems that may be operating in the area.',
            'low,moderate,high',
            4
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-19 Access Control For Mobile Devices',
                'Authorize the connection of mobile devices to organizational systems.',
                'low,moderate,high',
                'Usage restrictions and authorization to connect may vary among organizational systems. For example, the organization may authorize the connection of mobile devices to its network and impose a set of usage restrictions, while a system owner may withhold authorization for mobile device connection to specific applications or impose additional usage restrictions before allowing mobile device connections to a system. Adequate security for mobile devices goes beyond the requirements specified in &lt;a href=&#34;#ac-19&#34;&gt;AC-19&lt;/a&gt;. Many safeguards for mobile devices are reflected in other controls. &lt;a href=&#34;#ac-20&#34;&gt;AC-20&lt;/a&gt; addresses mobile devices that are not organization-controlled.',
                17
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-19(4) Restrictions For Classified Information',
            'Prohibit the use of unclassified mobile devices in facilities containing systems processing, storing, or transmitting classified information unless specifically permitted by the authorizing official; and Enforce the following restrictions on individuals permitted by the authorizing official to use unclassified mobile devices in facilities containing systems processing, storing, or transmitting classified information: Restrict the connection of classified mobile devices to classified systems in accordance with [Assignment: organization-defined security policies].',
            'None.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-19(5) Full Device Or Container-based Encryption',
            'Employ [Selection: full-device encryption; container-based encryption] to protect the confidentiality and integrity of information on [Assignment: organization-defined mobile devices].',
            'Container-based encryption provides a more fine-grained approach to data and information encryption on mobile devices, including encrypting selected data structures such as files, records, or fields.',
            'low,moderate,high',
            2
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-20 Use Of External Systems',
                'Prohibit the use of [Assignment: organizationally-defined types of external systems].',
                'low,moderate,high',
                'External systems used to access public interfaces to organizational systems are outside the scope of &lt;a href=&#34;#ac-20&#34;&gt;AC-20&lt;/a&gt;. Organizations establish specific terms and conditions for the use of external systems in accordance with organizational security policies and procedures. At a minimum, terms and conditions address the specific types of applications that can be accessed on organizational systems from external systems and the highest security category of information that can be processed, stored, or transmitted on external systems. If the terms and conditions with the owners of the external systems cannot be established, organizations may impose restrictions on organizational personnel using those external systems.',
                18
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-20(1) Limits On Authorized Use',
            'Permit authorized individuals to use an external system to access the system or to process, store, or transmit organization-controlled information only after:',
            'Limiting authorized use recognizes circumstances where individuals using external systems may need to access organizational systems. Organizations need assurance that the external systems contain the necessary controls so as not to compromise, damage, or otherwise harm organizational systems. Verification that the required controls have been implemented can be achieved by external, independent assessments, attestations, or other means, depending on the confidence level required by organizations.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-20(2) Portable Storage Devices - Restricted Use',
            'Restrict the use of organization-controlled portable storage devices by authorized individuals on external systems using [Assignment: organization-defined restrictions].',
            'Limits on the use of organization-controlled portable storage devices in external systems include restrictions on how the devices may be used and under what conditions the devices may be used.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-20(3) Non-organizationally Owned Systems - Restricted Use',
            'Restrict the use of non-organizationally owned systems or system components to process, store, or transmit organizational information using [Assignment: organization-defined restrictions].',
            'Non-organizationally owned systems or system components include systems or system components owned by other organizations as well as personally owned devices. There are potential risks to using non-organizationally owned systems or components. In some cases, the risk is sufficiently high as to prohibit such use (see &lt;a href=&#34;#ac-20_smt.b&#34;&gt;AC-20 b.&lt;/a&gt;). In other cases, the use of such systems or system components may be allowed but restricted in some way. Restrictions include requiring the implementation of approved controls prior to authorizing the connection of non-organizationally owned systems and components; limiting access to types of information, services, or applications; using virtualization techniques to limit processing and storage activities to servers or system components provisioned by the organization; and agreeing to the terms and conditions for usage. Organizations consult with the Office of the General Counsel regarding legal issues associated with using personally owned devices, including requirements for conducting forensic analyses during investigations after an incident.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-20(4) Network Accessible Storage Devices - Prohibited Use',
            'Prohibit the use of [Assignment: organization-defined network accessible storage devices] in external systems.',
            'Network-accessible storage devices in external systems include online storage devices in public, hybrid, or community cloud-based systems.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-20(5) Portable Storage Devices - Prohibited Use',
            'Prohibit the use of organization-controlled portable storage devices by authorized individuals on external systems.',
            'Limits on the use of organization-controlled portable storage devices in external systems include a complete prohibition of the use of such devices. Prohibiting such use is enforced using technical methods and/or nontechnical (i.e., process-based) methods.',
            'low,moderate,high',
            5
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-21 Information Sharing',
                'Employ [Assignment: organization-defined automated mechanisms or manual processes] to assist users in making information sharing and collaboration decisions.',
                'moderate,high',
                'Information sharing applies to information that may be restricted in some manner based on some formal or administrative determination. Examples of such information include, contract-sensitive information, classified information related to special access programs or compartments, privileged information, proprietary information, and personally identifiable information. Security and privacy risk assessments as well as applicable laws, regulations, and policies can provide useful inputs to these determinations. Depending on the circumstances, sharing partners may be defined at the individual, group, or organizational level. Information may be defined by content, type, security category, or special access program or compartment. Access restrictions may include non-disclosure agreements (NDA). Information flow techniques and security attributes may be used to provide automated assistance to users making sharing and collaboration decisions.',
                19
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-21(1) Automated Decision Support',
            'Employ [Assignment: organization-defined automated mechanisms] to enforce information-sharing decisions by authorized users based on access authorizations of sharing partners and access restrictions on information to be shared.',
            'Automated mechanisms are used to enforce information sharing decisions.',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-21(2) Information Search And Retrieval',
            'Implement information search and retrieval services that enforce [Assignment: organization-defined information sharing restrictions].',
            'Information search and retrieval services identify information system resources relevant to an information need.',
            'moderate,high',
            2
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-22 Publicly Accessible Content',
                'Review the content on the publicly accessible system for nonpublic information [Assignment: organization-defined frequency] and remove such information, if discovered.',
                'low,moderate,high',
                'In accordance with applicable laws, executive orders, directives, policies, regulations, standards, and guidelines, the public is not authorized to have access to nonpublic information, including information protected under the &lt;a href=&#34;https://www.govinfo.gov/content/pkg/STATUTE-88/pdf/STATUTE-88-Pg1896.pdf&#34;&gt;PRIVACT&lt;/a&gt; and proprietary information. Publicly accessible content addresses systems that are controlled by the organization and accessible to the public, typically without identification or authentication. Posting information on non-organizational systems (e.g., non-organizational public websites, forums, and social media) is covered by organizational policy. While organizations may have individuals who are responsible for developing and implementing policies about the information that can be made publicly accessible, publicly accessible content addresses the management of the individuals who make such information publicly accessible.',
                20
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-23 Data Mining Protection',
                'Employ [Assignment: organization-defined data mining prevention and detection techniques] for [Assignment: organization-defined data storage objects] to detect and protect against unauthorized data mining.',
                'moderate',
                '&lt;a href=&#34;https://obamawhitehouse.archives.gov/the-press-office/2011/10/07/executive-order-13587-structural-reforms-improve-security-classified-net&#34;&gt;EO 13587&lt;/a&gt; requires the establishment of an insider threat program for deterring, detecting, and mitigating insider threats, including the safeguarding of sensitive information from exploitation, compromise, or other unauthorized disclosure. Data mining protection requires organizations to identify appropriate techniques to prevent and detect unnecessary or unauthorized data mining. Data mining can be used by an insider to collect organizational information for the purpose of exfiltration.',
                21
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-24 Access Control Decisions',
                '[Selection: Establish procedures; Implement mechanisms] to ensure [Assignment: organization-defined access control decisions] are applied to each access request prior to access enforcement.',
                'moderate',
                'Access control decisions (also known as authorization decisions) occur when authorization information is applied to specific accesses. In contrast, access enforcement occurs when systems enforce access control decisions. While it is common to have access control decisions and access enforcement implemented by the same entity, it is not required, and it is not always an optimal implementation choice. For some architectures and distributed systems, different entities may make access control decisions and enforce access.',
                22
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'AC-24(1) Transmit Access Authorization Information',
            'Transmit [Assignment: organization-defined access authorization information] using [Assignment: organization-defined controls] to [Assignment: organization-defined systems] that enforce access control decisions.',
            'Authorization processes and access control decisions may occur in separate parts of systems or in separate systems. In such instances, authorization information is transmitted securely (e.g., using cryptographic mechanisms) so that timely access control decisions can be enforced at the appropriate locations. To support the access control decisions, it may be necessary to transmit as part of the access authorization information supporting security and privacy attributes. This is because in distributed systems, there are various access control decisions that need to be made, and different entities make these decisions in a serial fashion, each requiring those attributes to make the decisions. Protecting access authorization information ensures that such information cannot be altered, spoofed, or compromised during transmission.',
            'moderate',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'AC-24(2) No User Or Process Identity',
            'Enforce access control decisions based on [Assignment: organization-defined security or privacy attributes] that do not include the identity of the user or process acting on behalf of the user.',
            'In certain situations, it is important that access control decisions can be made without information regarding the identity of the users issuing the requests. These are generally instances where preserving individual privacy is of paramount importance. In other situations, user identification information is simply not needed for access control decisions, and especially in the case of distributed systems, transmitting such information with the needed degree of assurance may be very expensive or difficult to accomplish. MAC, RBAC, ABAC, and label-based control policies, for example, might not include user identity as an attribute.',
            'moderate',
            2
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'AC-25 Reference Monitor',
                'Implement a reference monitor for [Assignment: organization-defined access control policies] that is tamperproof, always invoked, and small enough to be subject to analysis and testing, the completeness of which can be assured.',
                'moderate',
                'A reference monitor is a set of design requirements on a reference validation mechanism that, as a key component of an operating system, enforces an access control policy over all subjects and objects. A reference validation mechanism is always invoked, tamper-proof, and small enough to be subject to analysis and tests, the completeness of which can be assured (i.e., verifiable). Information is represented internally within systems using abstractions known as data structures. Internal data structures can represent different types of entities, both active and passive. Active entities, also known as subjects, are associated with individuals, devices, or processes acting on behalf of individuals. Passive entities, also known as objects, are associated with data structures, such as records, buffers, communications ports, tables, files, and inter-process pipes. Reference monitors enforce access control policies that restrict access to objects based on the identity of subjects or groups to which the subjects belong. The system enforces the access control policy based on the rule set established by the policy. The tamper-proof property of the reference monitor prevents determined adversaries from compromising the functioning of the reference validation mechanism. The always invoked property prevents adversaries from bypassing the mechanism and violating the security policy. The smallness property helps to ensure completeness in the analysis and testing of the mechanism to detect any weaknesses or deficiencies (i.e., latent flaws) that would prevent the enforcement of the security policy.',
                23
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            TRUNCATE TABLE standard_controls;
            TRUNCATE TABLE standard_control_enhancements;
        `);
    }

}
