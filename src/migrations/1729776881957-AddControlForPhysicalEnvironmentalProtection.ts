import { MigrationInterface, QueryRunner } from "typeorm";

export class AddControlForPhysicalEnvironmentalProtection1729776881957 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Physical And Environmental Protection';

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-1 Policy And Procedures',
                'Review and update the current physical and environmental protection:',
                'low,moderate,high',
                'Physical and environmental protection policy and procedures address the controls in the PE family that are implemented within systems and organizations. The risk management strategy is an important factor in establishing such policies and procedures. Policies and procedures contribute to security and privacy assurance. Therefore, it is important that security and privacy programs collaborate on the development of physical and environmental protection policy and procedures. Security and privacy program policies and procedures at the organization level are preferable, in general, and may obviate the need for mission- or system-specific policies and procedures. The policy can be included as part of the general security and privacy policy or be represented by multiple policies that reflect the complex nature of organizations. Procedures can be established for security and privacy programs, for mission or business processes, and for systems, if needed. Procedures describe how the policies or controls are implemented and can be directed at the individual or role that is the object of the procedure. Procedures can be documented in system security and privacy plans or in one or more separate documents. Events that may precipitate an update to physical and environmental protection policy and procedures include assessment or audit findings, security incidents or breaches, or changes in applicable laws, executive orders, directives, regulations, policies, standards, and guidelines. Simply restating controls does not constitute an organizational policy or procedure.',
                114
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-2 Physical Access Authorizations',
                'Remove individuals from the facility access list when access is no longer required.',
                'low,moderate,high',
                'Physical access authorizations apply to employees and visitors. Individuals with permanent physical access authorization credentials are not considered visitors. Authorization credentials include ID badges, identification cards, and smart cards. Organizations determine the strength of authorization credentials needed consistent with applicable laws, executive orders, directives, regulations, policies, standards, and guidelines. Physical access authorizations may not be necessary to access certain areas within facilities that are designated as publicly accessible.',
                115
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-2(1) Access By Position Or Role',
            'Authorize physical access to the facility where the system resides based on position or role.',
            'Role-based facility access includes access by authorized permanent and regular/routine maintenance personnel, duty officers, and emergency medical staff.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-2(2) Two Forms Of Identification',
            'Require two forms of identification from the following forms of identification for visitor access to the facility where the system resides: [Assignment: organization-defined list of acceptable forms of identification].',
            'Acceptable forms of identification include passports, REAL ID-compliant drivers’ licenses, and Personal Identity Verification (PIV) cards. For gaining access to facilities using automated mechanisms, organizations may use PIV cards, key cards, PINs, and biometrics.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-2(3) Restrict Unescorted Access',
            'Restrict unescorted access to the facility where the system resides to personnel with [Selection (one or more): security clearances for all information contained within the system; formal access authorizations for all information contained within the system; need for access to all information contained within the system; [Assignment: organization-defined physical access authorizations]].',
            'Individuals without required security clearances, access approvals, or need to know are escorted by individuals with appropriate physical access authorizations to ensure that information is not exposed or otherwise compromised.',
            'low,moderate,high',
            3
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-3 Physical Access Control',
                'Change combinations and keys [Assignment: organization-defined frequency] and/or when keys are lost, combinations are compromised, or when individuals possessing the keys or combinations are transferred or terminated.',
                'low,moderate,high',
                'Physical access control applies to employees and visitors. Individuals with permanent physical access authorizations are not considered visitors. Physical access controls for publicly accessible areas may include physical access control logs/records, guards, or physical access devices and barriers to prevent movement from publicly accessible areas to non-public areas. Organizations determine the types of guards needed, including professional security staff, system users, or administrative staff. Physical access devices include keys, locks, combinations, biometric readers, and card readers. Physical access control systems comply with applicable laws, executive orders, directives, policies, regulations, standards, and guidelines. Organizations have flexibility in the types of audit logs employed. Audit logs can be procedural, automated, or some combination thereof. Physical access points can include facility access points, interior access points to systems that require supplemental access controls, or both. Components of systems may be in areas designated as publicly accessible with organizations controlling access to the components.',
                116
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-3(1) System Access',
            'Enforce physical access authorizations to the system in addition to the physical access controls for the facility at [Assignment: organization-defined physical spaces containing one or more components of the system].',
            'Control of physical access to the system provides additional physical security for those areas within facilities where there is a concentration of system components.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-3(2) Facility And Systems',
            'Perform security checks [Assignment: organization-defined frequency] at the physical perimeter of the facility or system for exfiltration of information or removal of system components.',
            'Organizations determine the extent, frequency, and/or randomness of security checks to adequately mitigate risk associated with exfiltration.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-3(3) Continuous Guards',
            'Employ guards to control [Assignment: organization-defined physical access points] to the facility where the system resides 24 hours per day, 7 days per week.',
            'Employing guards at selected physical access points to the facility provides a more rapid response capability for organizations. Guards also provide the opportunity for human surveillance in areas of the facility not covered by video surveillance.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-3(4) Lockable Casings',
            'Use lockable physical casings to protect [Assignment: organization-defined system components] from unauthorized physical access.',
            'The greatest risk from the use of portable devices—such as smart phones, tablets, and notebook computers—is theft. Organizations can employ lockable, physical casings to reduce or eliminate the risk of equipment theft. Such casings come in a variety of sizes, from units that protect a single notebook computer to full cabinets that can protect multiple servers, computers, and peripherals. Lockable physical casings can be used in conjunction with cable locks or lockdown plates to prevent the theft of the locked casing containing the computer equipment.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-3(5) Tamper Protection',
            'Employ [Assignment: organization-defined anti-tamper technologies] to [Selection (one or more): detect; prevent] physical tampering or alteration of [Assignment: organization-defined hardware components] within the system.',
            'Organizations can implement tamper detection and prevention at selected hardware components or implement tamper detection at some components and tamper prevention at other components. Detection and prevention activities can employ many types of anti-tamper technologies, including tamper-detection seals and anti-tamper coatings. Anti-tamper programs help to detect hardware alterations through counterfeiting and other supply chain-related risks.',
            'low,moderate,high',
            5
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-3(7) Physical Barriers',
            'Limit access using physical barriers.',
            'Physical barriers include bollards, concrete slabs, jersey walls, and hydraulic active vehicle barriers.',
            'low,moderate,high',
            6
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-3(8) Access Control Vestibules',
            'Employ access control vestibules at [Assignment: organization-defined locations within the facility].',
            'An access control vestibule is part of a physical access control system that typically provides a space between two sets of interlocking doors. Vestibules are designed to prevent unauthorized individuals from following authorized individuals into facilities with controlled access. This activity, also known as piggybacking or tailgating, results in unauthorized access to the facility. Interlocking door controllers can be used to limit the number of individuals who enter controlled access points and to provide containment areas while authorization for physical access is verified. Interlocking door controllers can be fully automated (i.e., controlling the opening and closing of the doors) or partially automated (i.e., using security guards to control the number of individuals entering the containment area).',
            'low,moderate,high',
            7
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-4 Access Control For Transmission',
                'Control physical access to [Assignment: organization-defined system distribution and transmission lines] within organizational facilities using [Assignment: organization-defined security controls].',
                'moderate,high',
                'Security controls applied to system distribution and transmission lines prevent accidental damage, disruption, and physical tampering. Such controls may also be necessary to prevent eavesdropping or modification of unencrypted transmissions. Security controls used to control physical access to system distribution and transmission lines include disconnected or locked spare jacks, locked wiring closets, protection of cabling by conduit or cable trays, and wiretapping sensors.',
                117
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-5 Access Control For Output Devices',
                'Control physical access to output from [Assignment: organization-defined output devices] to prevent unauthorized individuals from obtaining the output.',
                'moderate,high',
                'Controlling physical access to output devices includes placing output devices in locked rooms or other secured areas with keypad or card reader access controls and allowing access to authorized individuals only, placing output devices in locations that can be monitored by personnel, installing monitor or screen filters, and using headphones. Examples of output devices include monitors, printers, scanners, audio devices, facsimile machines, and copiers.',
                118
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-5(2) Link To Individual Identity',
            'Link individual identity to receipt of output from output devices.',
            'Methods for linking individual identity to the receipt of output from output devices include installing security functionality on facsimile machines, copiers, and printers. Such functionality allows organizations to implement authentication on output devices prior to the release of output to individuals.',
            'moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-6 Monitoring Physical Access',
                'Coordinate results of reviews and investigations with the organizational incident response capability.',
                'low,moderate,high',
                'Physical access monitoring includes publicly accessible areas within organizational facilities. Examples of physical access monitoring include the employment of guards, video surveillance equipment (i.e., cameras), and sensor devices. Reviewing physical access logs can help identify suspicious activity, anomalous events, or potential threats. The reviews can be supported by audit logging controls, such as &lt;a href=&#34;#au-2&#34;&gt;AU-2&lt;/a&gt;, if the access logs are part of an automated system. Organizational incident response capabilities include investigations of physical security incidents and responses to the incidents. Incidents include security violations or suspicious physical access activities. Suspicious physical access activities include accesses outside of normal work hours, repeated accesses to areas not normally accessed, accesses for unusual lengths of time, and out-of-sequence accesses.',
                119
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-6(1) Intrusion Alarms And Surveillance Equipment',
            'Monitor physical access to the facility where the system resides using physical intrusion alarms and surveillance equipment.',
            'Physical intrusion alarms can be employed to alert security personnel when unauthorized access to the facility is attempted. Alarm systems work in conjunction with physical barriers, physical access control systems, and security guards by triggering a response when these other forms of security have been compromised or breached. Physical intrusion alarms can include different types of sensor devices, such as motion sensors, contact sensors, and broken glass sensors. Surveillance equipment includes video cameras installed at strategic locations throughout the facility.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-6(2) Automated Intrusion Recognition And Responses',
            'Recognize [Assignment: organization-defined classes or types of intrusions] and initiate [Assignment: organization-defined response actions] using [Assignment: organization-defined automated mechanisms].',
            'Response actions can include notifying selected organizational personnel or law enforcement personnel. Automated mechanisms implemented to initiate response actions include system alert notifications, email and text messages, and activating door locking mechanisms. Physical access monitoring can be coordinated with intrusion detection systems and system monitoring capabilities to provide integrated threat coverage for the organization.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-6(3) Video Surveillance',
            'Employ video surveillance of [Assignment: organization-defined operational areas]; Review video recordings [Assignment: organization-defined frequency]; and Retain video recordings for [Assignment: organization-defined time period].',
            'Video surveillance focuses on recording activity in specified areas for the purposes of subsequent review, if circumstances so warrant. Video recordings are typically reviewed to detect anomalous events or incidents. Monitoring the surveillance video is not required, although organizations may choose to do so. There may be legal considerations when performing and retaining video surveillance, especially if such surveillance is in a public location.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-6(4) Monitoring Physical Access To Systems',
            'Monitor physical access to the system in addition to the physical access monitoring of the facility at [Assignment: organization-defined physical spaces containing one or more components of the system].',
            'Monitoring physical access to systems provides additional monitoring for those areas within facilities where there is a concentration of system components, including server rooms, media storage areas, and communications centers. Physical access monitoring can be coordinated with intrusion detection systems and system monitoring capabilities to provide comprehensive and integrated threat coverage for the organization.',
            'low,moderate,high',
            4
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-8 Visitor Access Records',
                'Report anomalies in visitor access records to [Assignment: organization-defined personnel].',
                'low,moderate,high',
                'Visitor access records include the names and organizations of individuals visiting, visitor signatures, forms of identification, dates of access, entry and departure times, purpose of visits, and the names and organizations of individuals visited. Access record reviews determine if access authorizations are current and are still required to support organizational mission and business functions. Access records are not required for publicly accessible areas.',
                120
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-8(1) Automated Records Maintenance And Review',
            'Maintain and review visitor access records using [Assignment: organization-defined automated mechanisms].',
            'Visitor access records may be stored and maintained in a database management system that is accessible by organizational personnel. Automated access to such records facilitates record reviews on a regular basis to determine if access authorizations are current and still required to support organizational mission and business functions.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-8(3) Limit Personally Identifiable Information Elements',
            'Limit personally identifiable information contained in visitor access records to the following elements identified in the privacy risk assessment: [Assignment: organization-defined elements].',
            'Organizations may have requirements that specify the contents of visitor access records. Limiting personally identifiable information in visitor access records when such information is not needed for operational purposes helps reduce the level of privacy risk created by a system.',
            'low,moderate,high',
            2
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-9 Power Equipment And Cabling',
                'Protect power equipment and power cabling for the system from damage and destruction.',
                'moderate,high',
                'Organizations determine the types of protection necessary for the power equipment and cabling employed at different locations that are both internal and external to organizational facilities and environments of operation. Types of power equipment and cabling include internal cabling and uninterruptable power sources in offices or data centers, generators and power cabling outside of buildings, and power sources for self-contained components such as satellites, vehicles, and other deployable systems.',
                121
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-9(1) Redundant Cabling',
            'Employ redundant power cabling paths that are physically separated by [Assignment: organization-defined distance].',
            'Physically separate and redundant power cables ensure that power continues to flow in the event that one of the cables is cut or otherwise damaged.',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-9(2) Automatic Voltage Controls',
            'Employ automatic voltage controls for [Assignment: organization-defined critical system components].',
            'Automatic voltage controls can monitor and control voltage. Such controls include voltage regulators, voltage conditioners, and voltage stabilizers.',
            'moderate,high',
            2
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-10 Emergency Shutoff',
                'Protect emergency power shutoff capability from unauthorized activation.',
                'moderate,high',
                'Emergency power shutoff primarily applies to organizational facilities that contain concentrations of system resources, including data centers, mainframe computer rooms, server rooms, and areas with computer-controlled machinery.',
                122
            )
            RETURNING id
        ) SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-11 Emergency Power',
                'Provide an uninterruptible power supply to facilitate [Selection (one or more): an orderly shutdown of the system; transition of the system to long-term alternate power] in the event of a primary power source loss.',
                'moderate,high',
                'An uninterruptible power supply (UPS) is an electrical system or mechanism that provides emergency power when there is a failure of the main power source. A UPS is typically used to protect computers, data centers, telecommunication equipment, or other electrical equipment where an unexpected power disruption could cause injuries, fatalities, serious mission or business disruption, or loss of data or information. A UPS differs from an emergency power system or backup generator in that the UPS provides near-instantaneous protection from unanticipated power interruptions from the main power source by providing energy stored in batteries, supercapacitors, or flywheels. The battery duration of a UPS is relatively short but provides sufficient time to start a standby power source, such as a backup generator, or properly shut down the system.',
                123
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-11(1) Alternate Power Supply - Minimal Operational Capability',
            'Provide an alternate power supply for the system that is activated [Selection: manually; automatically] and that can maintain minimally required operational capability in the event of an extended loss of the primary power source.',
            'Provision of an alternate power supply with minimal operating capability can be satisfied by accessing a secondary commercial power supply or other external power supply.',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-11(2) Alternate Power Supply - Self-contained',
            'Provide an alternate power supply for the system that is activated [Selection: manually; automatically] and that is:',
            'The provision of a long-term, self-contained power supply can be satisfied by using one or more generators with sufficient capacity to meet the needs of the organization.',
            'moderate,high',
            2
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-12 Emergency Lighting',
                'Employ and maintain automatic emergency lighting for the system that activates in the event of a power outage or disruption and that covers emergency exits and evacuation routes within the facility.',
                'low,moderate,high',
                'The provision of emergency lighting applies primarily to organizational facilities that contain concentrations of system resources, including data centers, server rooms, and mainframe computer rooms. Emergency lighting provisions for the system are described in the contingency plan for the organization. If emergency lighting for the system fails or cannot be provided, organizations consider alternate processing sites for power-related contingencies.',
                124
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-12(1) Essential Mission And Business Functions',
            'Provide emergency lighting for all areas within the facility supporting essential mission and business functions.',
            'Organizations define their essential missions and functions.',
            'low,moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-13 Fire Protection',
                'Employ and maintain fire detection and suppression systems that are supported by an independent energy source.',
                'low,moderate,high',
                'The provision of fire detection and suppression systems applies primarily to organizational facilities that contain concentrations of system resources, including data centers, server rooms, and mainframe computer rooms. Fire detection and suppression systems that may require an independent energy source include sprinkler systems and smoke detectors. An independent energy source is an energy source, such as a microgrid, that is separate, or can be separated, from the energy sources providing power for the other parts of the facility.',
                125
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-13(1) Detection Systems - Automatic Activation And Notification',
            'Employ fire detection systems that activate automatically and notify [Assignment: organization-defined personnel or roles] and [Assignment: organization-defined emergency responders] in the event of a fire.',
            'Organizations can identify personnel, roles, and emergency responders if individuals on the notification list need to have access authorizations or clearances (e.g., to enter to facilities where access is restricted due to the classification or impact level of information within the facility). Notification mechanisms may require independent energy sources to ensure that the notification capability is not adversely affected by the fire.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-13(2) Suppression Systems - Automatic Activation And Notification',
            'Employ fire suppression systems that activate automatically and notify [Assignment: organization-defined personnel or roles] and [Assignment: organization-defined emergency responders]; and Employ an automatic fire suppression capability when the facility is not staffed on a continuous basis.',
            'Organizations can identify specific personnel, roles, and emergency responders if individuals on the notification list need to have appropriate access authorizations and/or clearances (e.g., to enter to facilities where access is restricted due to the impact level or classification of information within the facility). Notification mechanisms may require independent energy sources to ensure that the notification capability is not adversely affected by the fire.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-13(4) Inspections',
            'Ensure that the facility undergoes [Assignment: organization-defined frequency] fire protection inspections by authorized and qualified inspectors and identified deficiencies are resolved within [Assignment: organization-defined time period].',
            'Authorized and qualified personnel within the jurisdiction of the organization include state, county, and city fire inspectors and fire marshals. Organizations provide escorts during inspections in situations where the systems that reside within the facilities contain sensitive information.',
            'low,moderate,high',
            3
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-14 Environmental Controls',
                'Monitor environmental control levels [Assignment: organization-defined frequency].',
                'low,moderate,high',
                'The provision of environmental controls applies primarily to organizational facilities that contain concentrations of system resources (e.g., data centers, mainframe computer rooms, and server rooms). Insufficient environmental controls, especially in very harsh environments, can have a significant adverse impact on the availability of systems and system components that are needed to support organizational mission and business functions.',
                126
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-14(1) Automatic Controls',
            'Employ the following automatic environmental controls in the facility to prevent fluctuations potentially harmful to the system: [Assignment: organization-defined automatic environmental controls].',
            'The implementation of automatic environmental controls provides an immediate response to environmental conditions that can damage, degrade, or destroy organizational systems or systems components.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'PE-14(2) Monitoring With Alarms And Notifications',
            'Employ environmental control monitoring that provides an alarm or notification of changes potentially harmful to personnel or equipment to [Assignment: organization-defined personnel or roles].',
            'The alarm or notification may be an audible alarm or a visual message in real time to personnel or roles defined by the organization. Such alarms and notifications can help minimize harm to individuals and damage to organizational assets by facilitating a timely incident response.',
            'low,moderate,high',
            2
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-15 Water Damage Protection',
                'Protect the system from damage resulting from water leakage by providing master shutoff or isolation valves that are accessible, working properly, and known to key personnel.',
                'low,moderate,high',
                'The provision of water damage protection primarily applies to organizational facilities that contain concentrations of system resources, including data centers, server rooms, and mainframe computer rooms. Isolation valves can be employed in addition to or in lieu of master shutoff valves to shut off water supplies in specific areas of concern without affecting entire organizations.',
                127
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-15(1) Automation Support',
            'Detect the presence of water near the system and alert [Assignment: organization-defined personnel or roles] using [Assignment: organization-defined automated mechanisms].',
            'Automated mechanisms include notification systems, water detection sensors, and alarms.',
            'low,moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-16 Delivery And Removal',
                'Maintain records of the system components.',
                'low,moderate,high',
                'Enforcing authorizations for entry and exit of system components may require restricting access to delivery areas and isolating the areas from the system and media libraries.',
                128
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-17 Alternate Work Site',
                'Provide a means for employees to communicate with information security and privacy personnel in case of incidents.',
                'moderate,high',
                'Alternate work sites include government facilities or the private residences of employees. While distinct from alternative processing sites, alternate work sites can provide readily available alternate locations during contingency operations. Organizations can define different sets of controls for specific alternate work sites or types of sites depending on the work-related activities conducted at the sites. Implementing and assessing the effectiveness of organization-defined controls and providing a means to communicate incidents at alternate work sites supports the contingency planning activities of organizations.',
                129
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-18 Location Of System Components',
                'Position system components within the facility to minimize potential damage from [Assignment: organization-defined physical and environmental hazards] and to minimize the opportunity for unauthorized access.',
                'high',
                'Physical and environmental hazards include floods, fires, tornadoes, earthquakes, hurricanes, terrorism, vandalism, an electromagnetic pulse, electrical interference, and other forms of incoming electromagnetic radiation. Organizations consider the location of entry points where unauthorized individuals, while not being granted access, might nonetheless be near systems. Such proximity can increase the risk of unauthorized access to organizational communications using wireless packet sniffers or microphones, or unauthorized disclosure of information.',
                130
            )
            RETURNING id
        ) SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-19 Information Leakage',
                'Protect the system from information leakage due to electromagnetic signals emanations.',
                'moderate',
                'Information leakage is the intentional or unintentional release of data or information to an untrusted environment from electromagnetic signals emanations. The security categories or classifications of systems (with respect to confidentiality), organizational security policies, and risk tolerance guide the selection of controls employed to protect systems against information leakage due to electromagnetic signals emanations.',
                131
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PE-19(1) National Emissions Policies And Procedures',
            'Protect system components, associated data communications, and networks in accordance with national Emissions Security policies and procedures based on the security category or classification of the information.',
            'Emissions Security (EMSEC) policies include the former TEMPEST policies.',
            'moderate',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-20 Asset Monitoring And Tracking',
                'Employ [Assignment: organization-defined asset location technologies] to track and monitor the location and movement of [Assignment: organization-defined assets] within [Assignment: organization-defined controlled areas].',
                'moderate',
                'Asset location technologies can help ensure that critical assets—including vehicles, equipment, and system components—remain in authorized locations. Organizations consult with the Office of the General Counsel and senior agency official for privacy regarding the deployment and use of asset location technologies to address potential privacy concerns.',
                132
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-21 Electromagnetic Pulse Protection',
                'Employ [Assignment: organization-defined protective measures] against electromagnetic pulse damage for [Assignment: organization-defined systems and system components].',
                'moderate',
                'An electromagnetic pulse (EMP) is a short burst of electromagnetic energy that is spread over a range of frequencies. Such energy bursts may be natural or man-made. EMP interference may be disruptive or damaging to electronic equipment. Protective measures used to mitigate EMP risk include shielding, surge suppressors, ferro-resonant transformers, and earth grounding. EMP protection may be especially significant for systems and applications that are part of the U.S. critical infrastructure.',
                133
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-22 Component Marking',
                'Mark [Assignment: organization-defined system hardware components] indicating the impact level or classification level of the information permitted to be processed, stored, or transmitted by the hardware component.',
                'moderate',
                'Hardware components that may require marking include input and output devices. Input devices include desktop and notebook computers, keyboards, tablets, and smart phones. Output devices include printers, monitors/video displays, facsimile machines, scanners, copiers, and audio devices. Permissions controlling output to the output devices are addressed in &lt;a href=&#34;#ac-3&#34;&gt;AC-3&lt;/a&gt; or &lt;a href=&#34;#ac-4&#34;&gt;AC-4&lt;/a&gt;. Components are marked to indicate the impact level or classification level of the system to which the devices are connected, or the impact level or classification level of the information permitted to be output. Security marking refers to the use of human-readable security attributes. Security labeling refers to the use of security attributes for internal system data structures. Security marking is generally not required for hardware components that process, store, or transmit information determined by organizations to be in the public domain or to be publicly releasable. However, organizations may require markings for hardware components that process, store, or transmit public information in order to indicate that such information is publicly releasable. Marking of system hardware components reflects applicable laws, executive orders, directives, policies, regulations, and standards.',
                134
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PE-23 Facility Location',
                'For existing facilities, consider the physical and environmental hazards in the organizational risk management strategy.',
                'moderate',
                'Physical and environmental hazards include floods, fires, tornadoes, earthquakes, hurricanes, terrorism, vandalism, an electromagnetic pulse, electrical interference, and other forms of incoming electromagnetic radiation. The location of system components within the facility is addressed in &lt;a href=&#34;#pe-18&#34;&gt;PE-18&lt;/a&gt;.',
                135
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Physical And Environmental Protection';

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
