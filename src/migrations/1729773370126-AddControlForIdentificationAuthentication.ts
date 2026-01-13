import { MigrationInterface, QueryRunner } from "typeorm";

export class AddControlForIdentificationAuthentication1729773370126 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Identification And Authentication';

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-1 Policy And Procedures',
                'Review and update the current identification and authentication:',
                'low,moderate,high',
                'Identification and authentication policy and procedures address the controls in the IA family that are implemented within systems and organizations. The risk management strategy is an important factor in establishing such policies and procedures. Policies and procedures contribute to security and privacy assurance. Therefore, it is important that security and privacy programs collaborate on the development of identification and authentication policy and procedures. Security and privacy program policies and procedures at the organization level are preferable, in general, and may obviate the need for mission- or system-specific policies and procedures. The policy can be included as part of the general security and privacy policy or be represented by multiple policies that reflect the complex nature of organizations. Procedures can be established for security and privacy programs, for mission or business processes, and for systems, if needed. Procedures describe how the policies or controls are implemented and can be directed at the individual or role that is the object of the procedure. Procedures can be documented in system security and privacy plans or in one or more separate documents. Events that may precipitate an update to identification and authentication policy and procedures include assessment or audit findings, security incidents or breaches, or changes in applicable laws, executive orders, directives, regulations, policies, standards, and guidelines. Simply restating controls does not constitute an organizational policy or procedure.',
                78
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-2 Identification And Authentication (organizational Users)',
                'Uniquely identify and authenticate organizational users and associate that unique identification with processes acting on behalf of those users.',
                'low,moderate,high',
                'The use of encrypted virtual private networks for network connections between organization-controlled endpoints and non-organization-controlled endpoints may be treated as internal networks with respect to protecting the confidentiality and integrity of information traversing the network. Identification and authentication requirements for non-organizational users are described in &lt;a href=&#34;#ia-8&#34;&gt;IA-8&lt;/a&gt;.',
                79
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'IA-2(1) Multi-factor Authentication To Privileged Accounts',
            'Implement multi-factor authentication for access to privileged accounts.',
            'Multi-factor authentication requires the use of two or more different factors to achieve authentication. The authentication factors are defined as follows: something you know (e.g., a personal identification number [PIN]), something you have (e.g., a physical authenticator such as a cryptographic private key), or something you are (e.g., a biometric). Multi-factor authentication solutions that feature physical authenticators include hardware authenticators that provide time-based or challenge-response outputs and smart cards such as the U.S. Government Personal Identity Verification (PIV) card or the Department of Defense (DoD) Common Access Card (CAC). In addition to authenticating users at the system level (i.e., at logon), organizations may employ authentication mechanisms at the application level, at their discretion, to provide increased security. Regardless of the type of access (i.e., local, network, remote), privileged accounts are authenticated using multi-factor options appropriate for the level of risk. Organizations can add additional security measures, such as additional or more rigorous authentication mechanisms, for specific types of access.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-2(2) Multi-factor Authentication To Non-privileged Accounts',
            'Implement multi-factor authentication for access to non-privileged accounts.',
            'Multi-factor authentication requires the use of two or more different factors to achieve authentication. The authentication factors are defined as follows: something you know (e.g., a personal identification number [PIN]), something you have (e.g., a physical authenticator such as a cryptographic private key), or something you are (e.g., a biometric). Multi-factor authentication solutions that feature physical authenticators include hardware authenticators that provide time-based or challenge-response outputs and smart cards such as the U.S. Government Personal Identity Verification card or the DoD Common Access Card. In addition to authenticating users at the system level, organizations may also employ authentication mechanisms at the application level, at their discretion, to provide increased information security. Regardless of the type of access (i.e., local, network, remote), non-privileged accounts are authenticated using multi-factor options appropriate for the level of risk. Organizations can provide additional security measures, such as additional or more rigorous authentication mechanisms, for specific types of access.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-2(5) Individual Authentication With Group Authentication',
            'When shared accounts or authenticators are employed, require users to be individually authenticated before granting access to the shared accounts or resources.',
            'Individual authentication prior to shared group authentication mitigates the risk of using group accounts or authenticators.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-2(6) Access To Accounts -separate Device',
            'Implement multi-factor authentication for [Selection (one or more): local; network; remote] access to [Selection (one or more): privileged accounts; non-privileged accounts] such that:',
            'The purpose of requiring a device that is separate from the system to which the user is attempting to gain access for one of the factors during multi-factor authentication is to reduce the likelihood of compromising authenticators or credentials stored on the system. Adversaries may be able to compromise such authenticators or credentials and subsequently impersonate authorized users. Implementing one of the factors on a separate device (e.g., a hardware token), provides a greater strength of mechanism and an increased level of assurance in the authentication process.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-2(8) Access To Accounts - Replay Resistant',
            'Implement replay-resistant authentication mechanisms for access to [Selection (one or more): privileged accounts; non-privileged accounts].',
            'Authentication processes resist replay attacks if it is impractical to achieve successful authentications by replaying previous authentication messages. Replay-resistant techniques include protocols that use nonces or challenges such as time synchronous or cryptographic authenticators.',
            'low,moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-2(10) Single Sign-on',
            'Provide a single sign-on capability for [Assignment: organization-defined system accounts and services].',
            'Single sign-on enables users to log in once and gain access to multiple system resources. Organizations consider the operational efficiencies provided by single sign-on capabilities with the risk introduced by allowing access to multiple systems via a single authentication event. Single sign-on can present opportunities to improve system security, for example by providing the ability to add multi-factor authentication for applications and systems (existing and new) that may not be able to natively support multi-factor authentication.',
            'low,moderate,high',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-2(12) Acceptance Of Piv Credentials',
            'Accept and electronically verify Personal Identity Verification-compliant credentials.',
            'Acceptance of Personal Identity Verification (PIV)-compliant credentials applies to organizations implementing logical access control and physical access control systems. PIV-compliant credentials are those credentials issued by federal agencies that conform to FIPS Publication 201 and supporting guidance documents. The adequacy and reliability of PIV card issuers are authorized using &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-79-2&#34;&gt;SP 800-79-2&lt;/a&gt;. Acceptance of PIV-compliant credentials includes derived PIV credentials, the use of which is addressed in &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-166&#34;&gt;SP 800-166&lt;/a&gt;. The DOD Common Access Card (CAC) is an example of a PIV credential.',
            'low,moderate,high',
            7
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-2(13) Out-of-band Authentication',
            'Implement the following out-of-band authentication mechanisms under [Assignment: organization-defined conditions]: [Assignment: organization-defined out-of-band authentication].',
            'Out-of-band authentication refers to the use of two separate communication paths to identify and authenticate users or devices to an information system. The first path (i.e., the in-band path) is used to identify and authenticate users or devices and is generally the path through which information flows. The second path (i.e., the out-of-band path) is used to independently verify the authentication and/or requested action. For example, a user authenticates via a notebook computer to a remote server to which the user desires access and requests some action of the server via that communication path. Subsequently, the server contacts the user via the user’s cell phone to verify that the requested action originated from the user. The user may confirm the intended action to an individual on the telephone or provide an authentication code via the telephone. Out-of-band authentication can be used to mitigate actual or suspected &lt;q&gt;man-in the-middle&lt;/q&gt; attacks. The conditions or criteria for activation include suspicious activities, new threat indicators, elevated threat levels, or the impact or classification level of information in requested transactions.',
            'low,moderate,high',
            8
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-3 Device Identification And Authentication',
                'Uniquely identify and authenticate [Assignment: organization-defined devices and/or types of devices] before establishing a [Selection (one or more): local; remote; network] connection.',
                'moderate,high',
                'Devices that require unique device-to-device identification and authentication are defined by type, device, or a combination of type and device. Organization-defined device types include devices that are not owned by the organization. Systems use shared known information (e.g., Media Access Control [MAC], Transmission Control Protocol/Internet Protocol [TCP/IP] addresses) for device identification or organizational authentication solutions (e.g., Institute of Electrical and Electronics Engineers (IEEE) 802.1x and Extensible Authentication Protocol [EAP], RADIUS server with EAP-Transport Layer Security [TLS] authentication, Kerberos) to identify and authenticate devices on local and wide area networks. Organizations determine the required strength of authentication mechanisms based on the security categories of systems and mission or business requirements. Because of the challenges of implementing device authentication on a large scale, organizations can restrict the application of the control to a limited number/type of devices based on mission or business needs.',
                80
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'IA-3(1) Cryptographic Bidirectional Authentication',
            'Authenticate [Assignment: organization-defined devices and/or types of devices] before establishing [Selection (one or more): local; remote; network] connection using bidirectional authentication that is cryptographically based.',
            'A local connection is a connection with a device that communicates without the use of a network. A network connection is a connection with a device that communicates through a network. A remote connection is a connection with a device that communicates through an external network. Bidirectional authentication provides stronger protection to validate the identity of other devices for connections that are of greater risk.',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-3(3) Dynamic Address Allocation',
            'Where addresses are allocated dynamically, standardize dynamic address allocation lease information and the lease duration assigned to devices in accordance with [Assignment: organization-defined lease information and lease duration]; and Audit lease information when assigned to a device.',
            'The Dynamic Host Configuration Protocol (DHCP) is an example of a means by which clients can dynamically receive network address assignments.',
            'moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-3(4) Device Attestation',
            'Handle device identification and authentication based on attestation by [Assignment: organization-defined configuration management process].',
            'Device attestation refers to the identification and authentication of a device based on its configuration and known operating state. Device attestation can be determined via a cryptographic hash of the device. If device attestation is the means of identification and authentication, then it is important that patches and updates to the device are handled via a configuration management process such that the patches and updates are done securely and do not disrupt identification and authentication to other devices.',
            'moderate,high',
            3
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-4 Identifier Management',
                'Preventing reuse of identifiers for [Assignment: organization-defined time period].',
                'low,moderate,high',
                'Common device identifiers include Media Access Control (MAC) addresses, Internet Protocol (IP) addresses, or device-unique token identifiers. The management of individual identifiers is not applicable to shared system accounts. Typically, individual identifiers are the usernames of the system accounts assigned to those individuals. In such instances, the account management activities of &lt;a href=&#34;#ac-2&#34;&gt;AC-2&lt;/a&gt; use account names provided by &lt;a href=&#34;#ia-4&#34;&gt;IA-4&lt;/a&gt;. Identifier management also addresses individual identifiers not necessarily associated with system accounts. Preventing the reuse of identifiers implies preventing the assignment of previously used individual, group, role, service, or device identifiers to different individuals, groups, roles, services, or devices.',
                81
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'IA-4(1) Prohibit Account Identifiers As Public Identifiers',
            'Prohibit the use of system account identifiers that are the same as public identifiers for individual accounts.',
            'Prohibiting account identifiers as public identifiers applies to any publicly disclosed account identifier used for communication such as, electronic mail and instant messaging. Prohibiting the use of systems account identifiers that are the same as some public identifier, such as the individual identifier section of an electronic mail address, makes it more difficult for adversaries to guess user identifiers. Prohibiting account identifiers as public identifiers without the implementation of other supporting controls only complicates guessing of identifiers. Additional protections are required for authenticators and credentials to protect the account.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-4(4) Identify User Status',
            'Manage individual identifiers by uniquely identifying each individual as [Assignment: organization-defined characteristic identifying individual status].',
            'Characteristics that identify the status of individuals include contractors, foreign nationals, and non-organizational users. Identifying the status of individuals by these characteristics provides additional information about the people with whom organizational personnel are communicating. For example, it might be useful for a government employee to know that one of the individuals on an email message is a contractor.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-4(5) Dynamic Management',
            'Manage individual identifiers dynamically in accordance with [Assignment: organization-defined dynamic identifier policy].',
            'In contrast to conventional approaches to identification that presume static accounts for preregistered users, many distributed systems establish identifiers at runtime for entities that were previously unknown. When identifiers are established at runtime for previously unknown entities, organizations can anticipate and provision for the dynamic establishment of identifiers. Pre-established trust relationships and mechanisms with appropriate authorities to validate credentials and related identifiers are essential.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-4(6) Cross-organization Management',
            'Coordinate with the following external organizations for cross-organization management of identifiers: [Assignment: organization-defined external organizations].',
            'Cross-organization identifier management provides the capability to identify individuals, groups, roles, or devices when conducting cross-organization activities involving the processing, storage, or transmission of information.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-4(8) Pairwise Pseudonymous Identifiers',
            'Generate pairwise pseudonymous identifiers.',
            'A pairwise pseudonymous identifier is an opaque unguessable subscriber identifier generated by an identity provider for use at a specific individual relying party. Generating distinct pairwise pseudonymous identifiers with no identifying information about a subscriber discourages subscriber activity tracking and profiling beyond the operational requirements established by an organization. The pairwise pseudonymous identifiers are unique to each relying party except in situations where relying parties can show a demonstrable relationship justifying an operational need for correlation, or all parties consent to being correlated in such a manner.',
            'low,moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-4(9) Attribute Maintenance And Protection',
            'Maintain the attributes for each uniquely identified individual, device, or service in [Assignment: organization-defined protected central storage].',
            'For each of the entities covered in &lt;a href=&#34;#ia-2&#34;&gt;IA-2&lt;/a&gt;, &lt;a href=&#34;#ia-3&#34;&gt;IA-3&lt;/a&gt;, &lt;a href=&#34;#ia-8&#34;&gt;IA-8&lt;/a&gt;, and &lt;a href=&#34;#ia-9&#34;&gt;IA-9&lt;/a&gt;, it is important to maintain the attributes for each authenticated entity on an ongoing basis in a central (protected) store.',
            'low,moderate,high',
            6
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-5 Authenticator Management',
                'Changing authenticators for group or role accounts when membership to those accounts changes.',
                'low,moderate,high',
                'Systems support authenticator management by organization-defined settings and restrictions for various authenticator characteristics (e.g., minimum password length, validation time window for time synchronous one-time tokens, and number of allowed rejections during the verification stage of biometric authentication). Actions can be taken to safeguard individual authenticators, including maintaining possession of authenticators, not sharing authenticators with others, and immediately reporting lost, stolen, or compromised authenticators. Authenticator management includes issuing and revoking authenticators for temporary access when no longer needed.',
                82
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'IA-5(1) Password-based Authentication',
            'For password-based authentication:',
            'Password-based authentication applies to passwords regardless of whether they are used in single-factor or multi-factor authentication. Long passwords or passphrases are preferable over shorter passwords. Enforced composition rules provide marginal security benefits while decreasing usability. However, organizations may choose to establish certain rules for password generation (e.g., minimum character length for long passwords) under certain circumstances and can enforce this requirement in IA-5(1)(h). Account recovery can occur, for example, in situations when a password is forgotten. Cryptographically protected passwords include salted one-way cryptographic hashes of passwords. The list of commonly used, compromised, or expected passwords includes passwords obtained from previous breach corpuses, dictionary words, and repetitive or sequential characters. The list includes context-specific words, such as the name of the service, username, and derivatives thereof.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(2) Public Key-based Authentication',
            'For public key-based authentication: When public key infrastructure (PKI) is used:',
            'Public key cryptography is a valid authentication mechanism for individuals, machines, and devices. For PKI solutions, status information for certification paths includes certificate revocation lists or certificate status protocol responses. For PIV cards, certificate validation involves the construction and verification of a certification path to the Common Policy Root trust anchor, which includes certificate policy processing. Implementing a local cache of revocation data to support path discovery and validation also supports system availability in situations where organizations are unable to access revocation information via the network.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(5) Change Authenticators Prior To Delivery',
            'Require developers and installers of system components to provide unique authenticators or change default authenticators prior to delivery and installation.',
            'Changing authenticators prior to the delivery and installation of system components extends the requirement for organizations to change default authenticators upon system installation by requiring developers and/or installers to provide unique authenticators or change default authenticators for system components prior to delivery and/or installation. However, it typically does not apply to developers of commercial off-the-shelf information technology products. Requirements for unique authenticators can be included in acquisition documents prepared by organizations when procuring systems or system components.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(6) Protection Of Authenticators',
            'Protect authenticators commensurate with the security category of the information to which use of the authenticator permits access.',
            'For systems that contain multiple security categories of information without reliable physical or logical separation between categories, authenticators used to grant access to the systems are protected commensurate with the highest security category of information on the systems. Security categories of information are determined as part of the security categorization process.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(7) No Embedded Unencrypted Static Authenticators',
            'Ensure that unencrypted static authenticators are not embedded in applications or other forms of static storage.',
            'In addition to applications, other forms of static storage include access scripts and function keys. Organizations exercise caution when determining whether embedded or stored authenticators are in encrypted or unencrypted form. If authenticators are used in the manner stored, then those representations are considered unencrypted authenticators.',
            'low,moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(8) Multiple System Accounts',
            'Implement [Assignment: organization-defined security controls] to manage the risk of compromise due to individuals having accounts on multiple systems.',
            'When individuals have accounts on multiple systems and use the same authenticators such as passwords, there is the risk that a compromise of one account may lead to the compromise of other accounts. Alternative approaches include having different authenticators (passwords) on all systems, employing a single sign-on or federation mechanism, or using some form of one-time passwords on all systems. Organizations can also use rules of behavior (see &lt;a href=&#34;#pl-4&#34;&gt;PL-4&lt;/a&gt;) and access agreements (see &lt;a href=&#34;#ps-6&#34;&gt;PS-6&lt;/a&gt;) to mitigate the risk of multiple system accounts.',
            'low,moderate,high',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(9) Federated Credential Management',
            'Use the following external organizations to federate credentials: [Assignment: organization-defined external organizations].',
            'Federation provides organizations with the capability to authenticate individuals and devices when conducting cross-organization activities involving the processing, storage, or transmission of information. Using a specific list of approved external organizations for authentication helps to ensure that those organizations are vetted and trusted.',
            'low,moderate,high',
            7
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(10) Dynamic Credential Binding',
            'Bind identities and authenticators dynamically using the following rules: [Assignment: organization-defined binding rules].',
            'Authentication requires some form of binding between an identity and the authenticator that is used to confirm the identity. In conventional approaches, binding is established by pre-provisioning both the identity and the authenticator to the system. For example, the binding between a username (i.e., identity) and a password (i.e., authenticator) is accomplished by provisioning the identity and authenticator as a pair in the system. New authentication techniques allow the binding between the identity and the authenticator to be implemented external to a system. For example, with smartcard credentials, the identity and authenticator are bound together on the smartcard. Using these credentials, systems can authenticate identities that have not been pre-provisioned, dynamically provisioning the identity after authentication. In these situations, organizations can anticipate the dynamic provisioning of identities. Pre-established trust relationships and mechanisms with appropriate authorities to validate identities and related credentials are essential.',
            'low,moderate,high',
            8
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(12) Biometric Authentication Performance',
            'For biometric-based authentication, employ mechanisms that satisfy the following biometric quality requirements [Assignment: organization-defined biometric quality requirements].',
            'Unlike password-based authentication, which provides exact matches of user-input passwords to stored passwords, biometric authentication does not provide exact matches. Depending on the type of biometric and the type of collection mechanism, there is likely to be some divergence from the presented biometric and the stored biometric that serves as the basis for comparison. Matching performance is the rate at which a biometric algorithm correctly results in a match for a genuine user and rejects other users. Biometric performance requirements include the match rate, which reflects the accuracy of the biometric matching algorithm used by a system.',
            'low,moderate,high',
            9
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(13) Expiration Of Cached Authenticators',
            'Prohibit the use of cached authenticators after [Assignment: organization-defined time period].',
            'Cached authenticators are used to authenticate to the local machine when the network is not available. If cached authentication information is out of date, the validity of the authentication information may be questionable.',
            'low,moderate,high',
            10
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(14) Managing Content Of Pki Trust Stores',
            'For PKI-based authentication, employ an organization-wide methodology for managing the content of PKI trust stores installed across all platforms, including networks, operating systems, browsers, and applications.',
            'An organization-wide methodology for managing the content of PKI trust stores helps improve the accuracy and currency of PKI-based authentication credentials across the organization.',
            'low,moderate,high',
            11
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(15) Gsa-approved Products And Services',
            'Use only General Services Administration-approved products and services for identity, credential, and access management.',
            'General Services Administration (GSA)-approved products and services are products and services that have been approved through the GSA conformance program, where applicable, and posted to the GSA Approved Products List. GSA provides guidance for teams to design and build functional and secure systems that comply with Federal Identity, Credential, and Access Management (FICAM) policies, technologies, and implementation patterns.',
            'low,moderate,high',
            12
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(16) In-person Or Trusted External Party Authenticator Issuance',
            'Require that the issuance of [Assignment: organization-defined types of and/or specific authenticators] be conducted [Selection: in person; by a trusted external party] before [Assignment: organization-defined registration authority] with authorization by [Assignment: organization-defined personnel or roles].',
            'Issuing authenticators in person or by a trusted external party enhances and reinforces the trustworthiness of the identity proofing process.',
            'low,moderate,high',
            13
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(17) Presentation Attack Detection For Biometric Authenticators',
            'Employ presentation attack detection mechanisms for biometric-based authentication.',
            'Biometric characteristics do not constitute secrets. Such characteristics can be obtained by online web accesses, taking a picture of someone with a camera phone to obtain facial images with or without their knowledge, lifting from objects that someone has touched (e.g., a latent fingerprint), or capturing a high-resolution image (e.g., an iris pattern). Presentation attack detection technologies including liveness detection, can mitigate the risk of these types of attacks by making it difficult to produce artifacts intended to defeat the biometric sensor.',
            'low,moderate,high',
            14
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-5(18) Password Managers',
            'Employ [Assignment: organization-defined password managers] to generate and manage passwords; and Protect the passwords using [Assignment: organization-defined controls].',
            'For systems where static passwords are employed, it is often a challenge to ensure that the passwords are suitably complex and that the same passwords are not employed on multiple systems. A password manager is a solution to this problem as it automatically generates and stores strong and different passwords for various accounts. A potential risk of using password managers is that adversaries can target the collection of passwords generated by the password manager. Therefore, the collection of passwords requires protection including encrypting the passwords (see &lt;a href=&#34;#ia-5.1_smt.d&#34;&gt;IA-5(1)(d)&lt;/a&gt;) and storing the collection offline in a token.',
            'low,moderate,high',
            15
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-6 Authentication Feedback',
                'Obscure feedback of authentication information during the authentication process to protect the information from possible exploitation and use by unauthorized individuals.',
                'low,moderate,high',
                'Authentication feedback from systems does not provide information that would allow unauthorized individuals to compromise authentication mechanisms. For some types of systems, such as desktops or notebooks with relatively large monitors, the threat (referred to as shoulder surfing) may be significant. For other types of systems, such as mobile devices with small displays, the threat may be less significant and is balanced against the increased likelihood of typographic input errors due to small keyboards. Thus, the means for obscuring authentication feedback is selected accordingly. Obscuring authentication feedback includes displaying asterisks when users type passwords into input devices or displaying feedback for a very limited time before obscuring it.',
                83
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-7 Cryptographic Module Authentication',
                'Implement mechanisms for authentication to a cryptographic module that meet the requirements of applicable laws, executive orders, directives, policies, regulations, standards, and guidelines for such authentication.',
                'low,moderate,high',
                'Authentication mechanisms may be required within a cryptographic module to authenticate an operator accessing the module and to verify that the operator is authorized to assume the requested role and perform services within that role.',
                84
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-8 Identification And Authentication (non-organizational Users)',
                'Uniquely identify and authenticate non-organizational users or processes acting on behalf of non-organizational users.',
                'low,moderate,high',
                'Non-organizational users include system users other than organizational users explicitly covered by &lt;a href=&#34;#ia-2&#34;&gt;IA-2&lt;/a&gt;. Non-organizational users are uniquely identified and authenticated for accesses other than those explicitly identified and documented in &lt;a href=&#34;#ac-14&#34;&gt;AC-14&lt;/a&gt;. Identification and authentication of non-organizational users accessing federal systems may be required to protect federal, proprietary, or privacy-related information (with exceptions noted for national security systems). Organizations consider many factors—including security, privacy, scalability, and practicality—when balancing the need to ensure ease of use for access to federal information and systems with the need to protect and adequately mitigate risk.',
                85
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'IA-8(1) Acceptance Of Piv Credentials From Other Agencies',
            'Accept and electronically verify Personal Identity Verification-compliant credentials from other federal agencies.',
            'Acceptance of Personal Identity Verification (PIV) credentials from other federal agencies applies to both logical and physical access control systems. PIV credentials are those credentials issued by federal agencies that conform to FIPS Publication 201 and supporting guidelines. The adequacy and reliability of PIV card issuers are addressed and authorized using &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-79-2&#34;&gt;SP 800-79-2&lt;/a&gt;.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-8(2) Acceptance Of External Authenticators',
            'Accept only external authenticators that are NIST-compliant; and Document and maintain a list of accepted external authenticators.',
            'Acceptance of only NIST-compliant external authenticators applies to organizational systems that are accessible to the public (e.g., public-facing websites). External authenticators are issued by nonfederal government entities and are compliant with &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-63b&#34;&gt;SP 800-63B&lt;/a&gt;. Approved external authenticators meet or exceed the minimum Federal Government-wide technical, security, privacy, and organizational maturity requirements. Meeting or exceeding Federal requirements allows Federal Government relying parties to trust external authenticators in connection with an authentication transaction at a specified authenticator assurance level.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-8(4) Use Of Defined Profiles',
            'Conform to the following profiles for identity management [Assignment: organization-defined identity management profiles].',
            'Organizations define profiles for identity management based on open identity management standards. To ensure that open identity management standards are viable, robust, reliable, sustainable, and interoperable as documented, the Federal Government assesses and scopes the standards and technology implementations against applicable laws, executive orders, directives, policies, regulations, standards, and guidelines.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-8(5) Acceptance Of Piv-i Credentials',
            'Accept and verify federated or PKI credentials that meet [Assignment: organization-defined policy].',
            'Acceptance of PIV-I credentials can be implemented by PIV, PIV-I, and other commercial or external identity providers. The acceptance and verification of PIV-I-compliant credentials apply to both logical and physical access control systems. The acceptance and verification of PIV-I credentials address nonfederal issuers of identity cards that desire to interoperate with United States Government PIV systems and that can be trusted by Federal Government-relying parties. The X.509 certificate policy for the Federal Bridge Certification Authority (FBCA) addresses PIV-I requirements. The PIV-I card is commensurate with the PIV credentials as defined in cited references. PIV-I credentials are the credentials issued by a PIV-I provider whose PIV-I certificate policy maps to the Federal Bridge PIV-I Certificate Policy. A PIV-I provider is cross-certified with the FBCA (directly or through another PKI bridge) with policies that have been mapped and approved as meeting the requirements of the PIV-I policies defined in the FBCA certificate policy.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-8(6) Disassociability',
            'Implement the following measures to disassociate user attributes or identifier assertion relationships among individuals, credential service providers, and relying parties: [Assignment: organization-defined measures].',
            'Federated identity solutions can create increased privacy risks due to the tracking and profiling of individuals. Using identifier mapping tables or cryptographic techniques to blind credential service providers and relying parties from each other or to make identity attributes less visible to transmitting parties can reduce these privacy risks.',
            'low,moderate,high',
            5
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-9 Service Identification And Authentication',
                'Uniquely identify and authenticate [Assignment: organization-defined system services and applications] before establishing communications with devices, users, or other services or applications.',
                'moderate',
                'Services that may require identification and authentication include web applications using digital certificates or services or applications that query a database. Identification and authentication methods for system services and applications include information or code signing, provenance graphs, and electronic signatures that indicate the sources of services. Decisions regarding the validity of identification and authentication claims can be made by services separate from the services acting on those decisions. This can occur in distributed system architectures. In such situations, the identification and authentication decisions (instead of actual identifiers and authentication data) are provided to the services that need to act on those decisions.',
                86
            )
            RETURNING id
        ) SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-10 Adaptive Authentication',
                'Require individuals accessing the system to employ [Assignment: organization-defined supplemental authentication techniques or mechanisms] under specific [Assignment: organization-defined circumstances or situations].',
                'moderate',
                'Adversaries may compromise individual authentication mechanisms employed by organizations and subsequently attempt to impersonate legitimate users. To address this threat, organizations may employ specific techniques or mechanisms and establish protocols to assess suspicious behavior. Suspicious behavior may include accessing information that individuals do not typically access as part of their duties, roles, or responsibilities; accessing greater quantities of information than individuals would routinely access; or attempting to access information from suspicious network addresses. When pre-established conditions or triggers occur, organizations can require individuals to provide additional authentication information. Another potential use for adaptive authentication is to increase the strength of mechanism based on the number or types of records being accessed. Adaptive authentication does not replace and is not used to avoid the use of multi-factor authentication mechanisms but can augment implementations of multi-factor authentication.',
                87
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-11 Re-authentication',
                'Require users to re-authenticate when [Assignment: organization-defined circumstances or situations requiring re-authentication].',
                'low,moderate,high',
                'In addition to the re-authentication requirements associated with device locks, organizations may require re-authentication of individuals in certain situations, including when roles, authenticators or credentials change, when security categories of systems change, when the execution of privileged functions occurs, after a fixed time period, or periodically.',
                88
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'IA-12 Identity Proofing',
                'Collect, validate, and verify identity evidence.',
                'moderate,high',
                'Identity proofing is the process of collecting, validating, and verifying a user’s identity information for the purposes of establishing credentials for accessing a system. Identity proofing is intended to mitigate threats to the registration of users and the establishment of their accounts. Standards and guidelines specifying identity assurance levels for identity proofing include &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-63-3&#34;&gt;SP 800-63-3&lt;/a&gt; and &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-63a&#34;&gt;SP 800-63A&lt;/a&gt;. Organizations may be subject to laws, executive orders, directives, regulations, or policies that address the collection of identity evidence. Organizational personnel consult with the senior agency official for privacy and legal counsel regarding such requirements.',
                89
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'IA-12(1) Supervisor Authorization',
            'Require that the registration process to receive an account for logical access includes supervisor or sponsor authorization.',
            'Including supervisor or sponsor authorization as part of the registration process provides an additional level of scrutiny to ensure that the user’s management chain is aware of the account, the account is essential to carry out organizational missions and functions, and the user’s privileges are appropriate for the anticipated responsibilities and authorities within the organization.',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-12(2) Identity Evidence',
            'Require evidence of individual identification be presented to the registration authority.',
            'Identity evidence, such as documentary evidence or a combination of documents and biometrics, reduces the likelihood of individuals using fraudulent identification to establish an identity or at least increases the work factor of potential adversaries. The forms of acceptable evidence are consistent with the risks to the systems, roles, and privileges associated with the user’s account.',
            'moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-12(3) Identity Evidence Validation And Verification',
            'Require that the presented identity evidence be validated and verified through [Assignment: organizational defined methods of validation and verification].',
            'Validation and verification of identity evidence increases the assurance that accounts and identifiers are being established for the correct user and authenticators are being bound to that user. Validation refers to the process of confirming that the evidence is genuine and authentic, and the data contained in the evidence is correct, current, and related to an individual. Verification confirms and establishes a linkage between the claimed identity and the actual existence of the user presenting the evidence. Acceptable methods for validating and verifying identity evidence are consistent with the risks to the systems, roles, and privileges associated with the users account.',
            'moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-12(4) In-person Validation And Verification',
            'Require that the validation and verification of identity evidence be conducted in person before a designated registration authority.',
            'In-person proofing reduces the likelihood of fraudulent credentials being issued because it requires the physical presence of individuals, the presentation of physical identity documents, and actual face-to-face interactions with designated registration authorities.',
            'moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-12(5) Address Confirmation',
            'Require that a [Selection: registration code; notice of proofing] be delivered through an out-of-band channel to verify the users address (physical or digital) of record.',
            'To make it more difficult for adversaries to pose as legitimate users during the identity proofing process, organizations can use out-of-band methods to ensure that the individual associated with an address of record is the same individual that participated in the registration. Confirmation can take the form of a temporary enrollment code or a notice of proofing. The delivery address for these artifacts is obtained from records and not self-asserted by the user. The address can include a physical or digital address. A home address is an example of a physical address. Email addresses and telephone numbers are examples of digital addresses.',
            'moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'IA-12(6) Accept Externally-proofed Identities',
            'Accept externally-proofed identities at [Assignment: organization-defined identity assurance level].',
            'To limit unnecessary re-proofing of identities, particularly of non-PIV users, organizations accept proofing conducted at a commensurate level of assurance by other agencies or organizations. Proofing is consistent with organizational security policy and the identity assurance level appropriate for the system, application, or information accessed. Accepting externally-proofed identities is a fundamental component of managing federated identities across agencies and organizations.',
            'moderate,high',
            6
        );`, [categoryName]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Identification And Authentication';

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
