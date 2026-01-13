import { MigrationInterface, QueryRunner } from "typeorm";

export class AddControlForMediaProtection1729776537686 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Media Protection';

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MP-1 Policy And Procedures',
                'Review and update the current media protection:',
                'low,moderate,high',
                'Media protection policy and procedures address the controls in the MP family that are implemented within systems and organizations. The risk management strategy is an important factor in establishing such policies and procedures. Policies and procedures contribute to security and privacy assurance. Therefore, it is important that security and privacy programs collaborate on the development of media protection policy and procedures. Security and privacy program policies and procedures at the organization level are preferable, in general, and may obviate the need for mission- or system-specific policies and procedures. The policy can be included as part of the general security and privacy policy or be represented by multiple policies that reflect the complex nature of organizations. Procedures can be established for security and privacy programs, for mission or business processes, and for systems, if needed. Procedures describe how the policies or controls are implemented and can be directed at the individual or role that is the object of the procedure. Procedures can be documented in system security and privacy plans or in one or more separate documents. Events that may precipitate an update to media protection policy and procedures include assessment or audit findings, security incidents or breaches, or changes in applicable laws, executive orders, directives, regulations, policies, standards, and guidelines. Simply restating controls does not constitute an organizational policy or procedure.',
                106
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MP-2 Media Access',
                'Restrict access to [Assignment: organization-defined types of digital and/or non-digital media] to [Assignment: organization-defined personnel or roles].',
                'low,moderate,high',
                'System media includes digital and non-digital media. Digital media includes flash drives, diskettes, magnetic tapes, external or removable hard disk drives (e.g., solid state, magnetic), compact discs, and digital versatile discs. Non-digital media includes paper and microfilm. Denying access to patient medical records in a community hospital unless the individuals seeking access to such records are authorized healthcare providers is an example of restricting access to non-digital media. Limiting access to the design specifications stored on compact discs in the media library to individuals on the system development team is an example of restricting access to digital media.',
                107
            )
            RETURNING id
        ) SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MP-3 Media Marking',
                'Exempt [Assignment: organization-defined types of system media] from marking if the media remain within [Assignment: organization-defined controlled areas].',
                'moderate,high',
                'Security marking refers to the application or use of human-readable security attributes. Digital media includes diskettes, magnetic tapes, external or removable hard disk drives (e.g., solid state, magnetic), flash drives, compact discs, and digital versatile discs. Non-digital media includes paper and microfilm. Controlled unclassified information is defined by the National Archives and Records Administration along with the appropriate safeguarding and dissemination requirements for such information and is codified in &lt;a href=&#34;https://www.federalregister.gov/documents/2016/09/14/2016-21665/controlled-unclassified-information&#34;&gt;32 CFR 2002&lt;/a&gt;. Security markings are generally not required for media that contains information determined by organizations to be in the public domain or to be publicly releasable. Some organizations may require markings for public information indicating that the information is publicly releasable. System media marking reflects applicable laws, executive orders, directives, policies, regulations, standards, and guidelines.',
                108
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MP-4 Media Storage',
                'Protect system media types defined in MP-4a until the media are destroyed or sanitized using approved equipment, techniques, and procedures.',
                'moderate,high',
                'System media includes digital and non-digital media. Digital media includes flash drives, diskettes, magnetic tapes, external or removable hard disk drives (e.g., solid state, magnetic), compact discs, and digital versatile discs. Non-digital media includes paper and microfilm. Physically controlling stored media includes conducting inventories, ensuring procedures are in place to allow individuals to check out and return media to the library, and maintaining accountability for stored media. Secure storage includes a locked drawer, desk, or cabinet or a controlled media library. The type of media storage is commensurate with the security category or classification of the information on the media. Controlled areas are spaces that provide physical and procedural controls to meet the requirements established for protecting information and systems. Fewer controls may be needed for media that contains information determined to be in the public domain, publicly releasable, or have limited adverse impacts on organizations, operations, or individuals if accessed by other than authorized personnel. In these situations, physical access controls provide adequate protection.',
                109
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'MP-4(2) Automated Restricted Access',
            'Restrict access to media storage areas and log access attempts and access granted using [Assignment: organization-defined automated mechanisms].',
            'Automated mechanisms include keypads, biometric readers, or card readers on the external entries to media storage areas.',
            'moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MP-5 Media Transport',
                'Restrict the activities associated with the transport of system media to authorized personnel.',
                'moderate,high',
                'System media includes digital and non-digital media. Digital media includes flash drives, diskettes, magnetic tapes, external or removable hard disk drives (e.g., solid state and  magnetic), compact discs, and digital versatile discs. Non-digital media includes microfilm and paper. Controlled areas are spaces for which organizations provide physical or procedural controls to meet requirements established for protecting information and systems. Controls to protect media during transport include cryptography and locked containers. Cryptographic mechanisms can provide confidentiality and integrity protections depending on the mechanisms implemented. Activities associated with media transport include releasing media for transport, ensuring that media enters the appropriate transport processes, and the actual transport. Authorized transport and courier personnel may include individuals external to the organization. Maintaining accountability of media during transport includes restricting transport activities to authorized personnel and tracking and/or obtaining records of transport activities as the media moves through the transportation system to prevent and detect loss, destruction, or tampering. Organizations establish documentation requirements for activities associated with the transport of system media in accordance with organizational assessments of risk. Organizations maintain the flexibility to define record-keeping methods for the different types of media transport as part of a system of transport-related records.',
                110
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'MP-5(3) Custodians',
            'Employ an identified custodian during transport of system media outside of controlled areas.',
            'Identified custodians provide organizations with specific points of contact during the media transport process and facilitate individual accountability. Custodial responsibilities can be transferred from one individual to another if an unambiguous custodian is identified.',
            'moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MP-6 Media Sanitization',
                'Employ sanitization mechanisms with the strength and integrity commensurate with the security category or classification of the information.',
                'low,moderate,high',
                'Media sanitization applies to all digital and non-digital system media subject to disposal or reuse, whether or not the media is considered removable. Examples include digital media in scanners, copiers, printers, notebook computers, workstations, network components, mobile devices, and non-digital media (e.g., paper and microfilm). The sanitization process removes information from system media such that the information cannot be retrieved or reconstructed. Sanitization techniques—including clearing, purging, cryptographic erase, de-identification of personally identifiable information, and destruction—prevent the disclosure of information to unauthorized individuals when such media is reused or released for disposal. Organizations determine the appropriate sanitization methods, recognizing that destruction is sometimes necessary when other methods cannot be applied to media requiring sanitization. Organizations use discretion on the employment of approved sanitization techniques and procedures for media that contains information deemed to be in the public domain or publicly releasable or information deemed to have no adverse impact on organizations or individuals if released for reuse or disposal. Sanitization of non-digital media includes destruction, removing a classified appendix from an otherwise unclassified document, or redacting selected sections or words from a document by obscuring the redacted sections or words in a manner equivalent in effectiveness to removing them from the document. NSA standards and policies control the sanitization process for media that contains classified information. NARA policies control the sanitization process for controlled unclassified information.',
                111
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'MP-6(1) Review, Approve, Track, Document, And Verify',
            'Review, approve, track, document, and verify media sanitization and disposal actions.',
            'Organizations review and approve media to be sanitized to ensure compliance with records retention policies. Tracking and documenting actions include listing personnel who reviewed and approved sanitization and disposal actions, types of media sanitized, files stored on the media, sanitization methods used, date and time of the sanitization actions, personnel who performed the sanitization, verification actions taken and personnel who performed the verification, and the disposal actions taken. Organizations verify that the sanitization of the media was effective prior to disposal.',
            'low,moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'MP-6(2) Equipment Testing',
            'Test sanitization equipment and procedures [Assignment: organization-defined frequency] to ensure that the intended sanitization is being achieved.',
            'Testing of sanitization equipment and procedures may be conducted by qualified and authorized external entities, including federal agencies or external service providers.',
            'low,moderate,high',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'MP-6(3) Nondestructive Techniques',
            'Apply nondestructive sanitization techniques to portable storage devices prior to connecting such devices to the system under the following circumstances: [Assignment: organization-defined circumstances requiring sanitization of portable storage devices].',
            'Portable storage devices include external or removable hard disk drives (e.g., solid state, magnetic), optical discs, magnetic or optical tapes, flash memory devices, flash memory cards, and other external or removable disks. Portable storage devices can be obtained from untrustworthy sources and contain malicious code that can be inserted into or transferred to organizational systems through USB ports or other entry portals. While scanning storage devices is recommended, sanitization provides additional assurance that such devices are free of malicious code. Organizations consider nondestructive sanitization of portable storage devices when the devices are purchased from manufacturers or vendors prior to initial use or when organizations cannot maintain a positive chain of custody for the devices.',
            'low,moderate,high',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'MP-6(7) Dual Authorization',
            'Enforce dual authorization for the sanitization of [Assignment: organization-defined system media].',
            'Organizations employ dual authorization to help ensure that system media sanitization cannot occur unless two technically qualified individuals conduct the designated task. Individuals who sanitize system media possess sufficient skills and expertise to determine if the proposed sanitization reflects applicable federal and organizational standards, policies, and procedures. Dual authorization also helps to ensure that sanitization occurs as intended, protecting against errors and false claims of having performed the sanitization actions. Dual authorization may also be known as two-person control. To reduce the risk of collusion, organizations consider rotating dual authorization duties to other individuals.',
            'low,moderate,high',
            4
        ),
        (
            (SELECT id FROM inserted_control),
            'MP-6(8) Remote Purging Or Wiping Of Information',
            'Provide the capability to purge or wipe information from [Assignment: organization-defined systems or system components] [Selection: remotely; under the following conditions: [Assignment: organization-defined conditions]].',
            'Remote purging or wiping of information protects information on organizational systems and system components if systems or components are obtained by unauthorized individuals. Remote purge or wipe commands require strong authentication to help mitigate the risk of unauthorized individuals purging or wiping the system, component, or device. The purge or wipe function can be implemented in a variety of ways, including by overwriting data or information multiple times or by destroying the key necessary to decrypt encrypted data.',
            'low,moderate,high',
            5
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MP-7 Media Use',
                'Prohibit the use of portable storage devices in organizational systems when such devices have no identifiable owner.',
                'low,moderate,high',
                'System media includes both digital and non-digital media. Digital media includes diskettes, magnetic tapes, flash drives, compact discs, digital versatile discs, and removable hard disk drives. Non-digital media includes paper and microfilm. Media use protections also apply to mobile devices with information storage capabilities. In contrast to &lt;a href=&#34;#mp-2&#34;&gt;MP-2&lt;/a&gt;, which restricts user access to media, MP-7 restricts the use of certain types of media on systems, for example, restricting or prohibiting the use of flash drives or external hard disk drives. Organizations use technical and nontechnical controls to restrict the use of system media. Organizations may restrict the use of portable storage devices, for example, by using physical cages on workstations to prohibit access to certain external ports or disabling or removing the ability to insert, read, or write to such devices. Organizations may also limit the use of portable storage devices to only approved devices, including devices provided by the organization, devices provided by other approved organizations, and devices that are not personally owned. Finally, organizations may restrict the use of portable storage devices based on the type of device, such as by prohibiting the use of writeable, portable storage devices and implementing this restriction by disabling or removing the capability to write to such devices. Requiring identifiable owners for storage devices reduces the risk of using such devices by allowing organizations to assign responsibility for addressing known vulnerabilities in the devices.',
                112
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'MP-7(2) Prohibit Use Of Sanitization-resistant Media',
            'Prohibit the use of sanitization-resistant media in organizational systems.',
            'Sanitization resistance refers to how resistant media are to non-destructive sanitization techniques with respect to the capability to purge information from media. Certain types of media do not support sanitization commands, or if supported, the interfaces are not supported in a standardized way across these devices. Sanitization-resistant media includes compact flash, embedded flash on boards and devices, solid state drives, and USB removable media.',
            'low,moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'MP-8 Media Downgrading',
                'Downgrade the identified system media using the established process.',
                'moderate',
                'Media downgrading applies to digital and non-digital media subject to release outside of the organization, whether the media is considered removable or not. When applied to system media, the downgrading process removes information from the media, typically by security category or classification level, such that the information cannot be retrieved or reconstructed. Downgrading of media includes redacting information to enable wider release and distribution. Downgrading ensures that empty space on the media is devoid of information.',
                113
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'MP-8(1) Documentation Of Process',
            'Document system media downgrading actions.',
            'Organizations can document the media downgrading process by providing information, such as the downgrading technique employed, the identification number of the downgraded media, and the identity of the individual that authorized and/or performed the downgrading action.',
            'moderate',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'MP-8(2) Equipment Testing',
            'Test downgrading equipment and procedures [Assignment: organization-defined frequency] to ensure that downgrading actions are being achieved.',
            'None.',
            'moderate',
            2
        ),
        (
            (SELECT id FROM inserted_control),
            'MP-8(3) Controlled Unclassified Information',
            'Downgrade system media containing controlled unclassified information prior to public release.',
            'The downgrading of controlled unclassified information uses approved sanitization tools, techniques, and procedures.',
            'moderate',
            3
        ),
        (
            (SELECT id FROM inserted_control),
            'MP-8(4) Classified Information',
            'Downgrade system media containing classified information prior to release to individuals without required access authorizations.',
            'Downgrading of classified information uses approved sanitization tools, techniques, and procedures to transfer information confirmed to be unclassified from classified systems to unclassified media.',
            'moderate',
            4
        );`, [categoryName]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Media Protection';

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
