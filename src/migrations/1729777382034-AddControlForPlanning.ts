import { MigrationInterface, QueryRunner } from "typeorm";

export class AddControlForPlanning1729777382034 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Planning';

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PL-1 Policy And Procedures',
                'Review and update the current planning:',
                'low,moderate,high',
                'Planning policy and procedures for the controls in the PL family implemented within systems and organizations. The risk management strategy is an important factor in establishing such policies and procedures. Policies and procedures contribute to security and privacy assurance. Therefore, it is important that security and privacy programs collaborate on their development. Security and privacy program policies and procedures at the organization level are preferable, in general, and may obviate the need for mission level or system-specific policies and procedures. The policy can be included as part of the general security and privacy policy or be represented by multiple policies that reflect the complex nature of organizations. Procedures can be established for security and privacy programs, for mission/business processes, and for systems, if needed. Procedures describe how the policies or controls are implemented and can be directed at the individual or role that is the object of the procedure. Procedures can be documented in system security and privacy plans or in one or more separate documents. Events that may precipitate an update to planning policy and procedures include, but are not limited to, assessment or audit findings, security incidents or breaches, or changes in laws, executive orders, directives, regulations, policies, standards, and guidelines. Simply restating controls does not constitute an organizational policy or procedure.',
                136
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PL-2 System Security And Privacy Plans',
                'Protect the plans from unauthorized disclosure and modification.',
                'low,moderate,high',
                'Security- and privacy-related activities that may require coordination and planning with other individuals or groups within the organization include assessments, audits, inspections, hardware and software maintenance, acquisition and supply chain risk management, patch management, and contingency plan testing. Planning and coordination include emergency and nonemergency (i.e., planned or non-urgent unplanned) situations. The process defined by organizations to plan and coordinate security- and privacy-related activities can also be included in other documents, as appropriate.',
                137
            )
            RETURNING id
        ) SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PL-4 Rules Of Behavior',
                'Require individuals who have acknowledged a previous version of the rules of behavior to read and re-acknowledge [Selection (one or more): [Assignment: organization-defined frequency]; when the rules are revised or updated].',
                'low,moderate,high',
                'Rules of behavior represent a type of access agreement for organizational users. Other types of access agreements include nondisclosure agreements, conflict-of-interest agreements, and acceptable use agreements (see &lt;a href=&#34;#ps-6&#34;&gt;PS-6&lt;/a&gt;). Organizations consider rules of behavior based on individual user roles and responsibilities and differentiate between rules that apply to privileged users and rules that apply to general users. Establishing rules of behavior for some types of non-organizational users, including individuals who receive information from federal systems, is often not feasible given the large number of such users and the limited nature of their interactions with the systems. Rules of behavior for organizational and non-organizational users can also be established in &lt;a href=&#34;#ac-8&#34;&gt;AC-8&lt;/a&gt;. The related controls section provides a list of controls that are relevant to organizational rules of behavior. &lt;a href=&#34;#pl-4_smt.b&#34;&gt;PL-4b&lt;/a&gt;, the documented acknowledgment portion of the control, may be satisfied by the literacy training and awareness and role-based training programs conducted by organizations if such training includes rules of behavior. Documented acknowledgements for rules of behavior include electronic or physical signatures and electronic agreement check boxes or radio buttons.',
                138
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PL-4(1) Social Media And External Site/application Usage Restrictions',
            'Include in the rules of behavior, restrictions on:',
            'Social media, social networking, and external site/application usage restrictions address rules of behavior related to the use of social media, social networking, and external sites when organizational personnel are using such sites for official duties or in the conduct of official business, when organizational information is involved in social media and social networking transactions, and when personnel access social media and networking sites from organizational systems. Organizations also address specific rules that prevent unauthorized entities from obtaining non-public organizational information from social media and networking sites either directly or through inference. Non-public information includes personally identifiable information and system account information.',
            'low,moderate,high',
            1
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PL-7 Concept Of Operations',
                'Review and update the CONOPS [Assignment: organization-defined frequency].',
                'moderate',
                'The CONOPS may be included in the security or privacy plans for the system or in other system development life cycle documents. The CONOPS is a living document that requires updating throughout the system development life cycle. For example, during system design reviews, the concept of operations is checked to ensure that it remains consistent with the design for controls, the system architecture, and the operational procedures. Changes to the CONOPS are reflected in ongoing updates to the security and privacy plans, security and privacy architectures, and other organizational documents, such as procurement specifications, system development life cycle documents, and systems engineering documents.',
                139
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PL-8 Security And Privacy Architectures',
                'Reflect planned architecture changes in security and privacy plans, Concept of Operations (CONOPS), criticality analysis, organizational procedures, and procurements and acquisitions.',
                'moderate,high',
                '&lt;a href=&#34;#pl-8&#34;&gt;PL-8&lt;/a&gt; is primarily directed at organizations to ensure that architectures are developed for the system and, moreover, that the architectures are integrated with or tightly coupled to the enterprise architecture. In contrast, &lt;a href=&#34;#sa-17&#34;&gt;SA-17&lt;/a&gt; is primarily directed at the external information technology product and system developers and integrators. &lt;a href=&#34;#sa-17&#34;&gt;SA-17&lt;/a&gt;, which is complementary to &lt;a href=&#34;#pl-8&#34;&gt;PL-8&lt;/a&gt;, is selected when organizations outsource the development of systems or components to external entities and when there is a need to demonstrate consistency with the organization’s enterprise architecture and security and privacy architectures.',
                140
            )
            RETURNING id
        )
        INSERT INTO standard_control_enhancements (control_id, name, description, implementation, risk_levels, order_index) VALUES
        (
            (SELECT id FROM inserted_control),
            'PL-8(1) Defense In Depth',
            'Design the security and privacy architectures for the system using a defense-in-depth approach that:',
            'Organizations strategically allocate security and privacy controls in the security and privacy architectures so that adversaries must overcome multiple controls to achieve their objective. Requiring adversaries to defeat multiple controls makes it more difficult to attack information resources by increasing the work factor of the adversary; it also increases the likelihood of detection. The coordination of allocated controls is essential to ensure that an attack that involves one control does not create adverse, unintended consequences by interfering with other controls. Unintended consequences can include system lockout and cascading alarms. The placement of controls in systems and organizations is an important activity that requires thoughtful analysis. The value of organizational assets is an important consideration in providing additional layering. Defense-in-depth architectural approaches include modularity and layering (see &lt;a href=&#34;#sa-8.3&#34;&gt;SA-8(3)&lt;/a&gt;), separation of system and user functionality (see &lt;a href=&#34;#sc-2&#34;&gt;SC-2&lt;/a&gt;), and security function isolation (see &lt;a href=&#34;#sc-3&#34;&gt;SC-3&lt;/a&gt;).',
            'moderate,high',
            1
        ),
        (
            (SELECT id FROM inserted_control),
            'PL-8(2) Supplier Diversity',
            'Require that [Assignment: organization-defined controls] allocated to [Assignment: organization-defined locations and architectural layers] are obtained from different suppliers.',
            'Information technology products have different strengths and weaknesses. Providing a broad spectrum of products complements the individual offerings. For example, vendors offering malicious code protection typically update their products at different times, often developing solutions for known viruses, Trojans, or worms based on their priorities and development schedules. By deploying different products at different locations, there is an increased likelihood that at least one of the products will detect the malicious code. With respect to privacy, vendors may offer products that track personally identifiable information in systems. Products may use different tracking methods. Using multiple products may result in more assurance that personally identifiable information is inventoried.',
            'moderate,high',
            2
        );`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PL-9 Central Management',
                'Centrally manage [Assignment: organization-defined controls and related processes].',
                'moderate',
                'As part of the control selection processes, organizations determine the controls that may be suitable for central management based on resources and capabilities. It is not always possible to centrally manage every aspect of a control. In such cases, the control can be treated as a hybrid control with the control managed and implemented centrally or at the system level. The controls and control enhancements that are candidates for full or partial central management include but are not limited to: &lt;a href=&#34;#ac-2.1&#34;&gt;AC-2(1)&lt;/a&gt;, &lt;a href=&#34;#ac-2.2&#34;&gt;AC-2(2)&lt;/a&gt;, &lt;a href=&#34;#ac-2.3&#34;&gt;AC-2(3)&lt;/a&gt;, &lt;a href=&#34;#ac-2.4&#34;&gt;AC-2(4)&lt;/a&gt;, &lt;a href=&#34;#ac-4&#34;&gt;AC-4(all)&lt;/a&gt;, &lt;a href=&#34;#ac-17.1&#34;&gt;AC-17(1)&lt;/a&gt;, &lt;a href=&#34;#ac-17.2&#34;&gt;AC-17(2)&lt;/a&gt;, &lt;a href=&#34;#ac-17.3&#34;&gt;AC-17(3)&lt;/a&gt;, &lt;a href=&#34;#ac-17.9&#34;&gt;AC-17(9)&lt;/a&gt;, &lt;a href=&#34;#ac-18.1&#34;&gt;AC-18(1)&lt;/a&gt;, &lt;a href=&#34;#ac-18.3&#34;&gt;AC-18(3)&lt;/a&gt;, &lt;a href=&#34;#ac-18.4&#34;&gt;AC-18(4)&lt;/a&gt;, &lt;a href=&#34;#ac-18.5&#34;&gt;AC-18(5)&lt;/a&gt;, &lt;a href=&#34;#ac-19.4&#34;&gt;AC-19(4)&lt;/a&gt;, &lt;a href=&#34;#ac-22&#34;&gt;AC-22&lt;/a&gt;, &lt;a href=&#34;#ac-23&#34;&gt;AC-23&lt;/a&gt;, &lt;a href=&#34;#at-2.1&#34;&gt;AT-2(1)&lt;/a&gt;, &lt;a href=&#34;#at-2.2&#34;&gt;AT-2(2)&lt;/a&gt;, &lt;a href=&#34;#at-3.1&#34;&gt;AT-3(1)&lt;/a&gt;, &lt;a href=&#34;#at-3.2&#34;&gt;AT-3(2)&lt;/a&gt;, &lt;a href=&#34;#at-3.3&#34;&gt;AT-3(3)&lt;/a&gt;, &lt;a href=&#34;#at-4&#34;&gt;AT-4&lt;/a&gt;, &lt;a href=&#34;#au-3&#34;&gt;AU-3&lt;/a&gt;, &lt;a href=&#34;#au-6.1&#34;&gt;AU-6(1)&lt;/a&gt;, &lt;a href=&#34;#au-6.3&#34;&gt;AU-6(3)&lt;/a&gt;, &lt;a href=&#34;#au-6.5&#34;&gt;AU-6(5)&lt;/a&gt;, &lt;a href=&#34;#au-6.6&#34;&gt;AU-6(6)&lt;/a&gt;, &lt;a href=&#34;#au-6.9&#34;&gt;AU-6(9)&lt;/a&gt;, &lt;a href=&#34;#au-7.1&#34;&gt;AU-7(1)&lt;/a&gt;, &lt;a href=&#34;#au-7.2&#34;&gt;AU-7(2)&lt;/a&gt;, &lt;a href=&#34;#au-11&#34;&gt;AU-11&lt;/a&gt;, &lt;a href=&#34;#au-13&#34;&gt;AU-13&lt;/a&gt;, &lt;a href=&#34;#au-16&#34;&gt;AU-16&lt;/a&gt;, &lt;a href=&#34;#ca-2.1&#34;&gt;CA-2(1)&lt;/a&gt;, &lt;a href=&#34;#ca-2.2&#34;&gt;CA-2(2)&lt;/a&gt;, &lt;a href=&#34;#ca-2.3&#34;&gt;CA-2(3)&lt;/a&gt;, &lt;a href=&#34;#ca-3.1&#34;&gt;CA-3(1)&lt;/a&gt;, &lt;a href=&#34;#ca-3.2&#34;&gt;CA-3(2)&lt;/a&gt;, &lt;a href=&#34;#ca-3.3&#34;&gt;CA-3(3)&lt;/a&gt;, &lt;a href=&#34;#ca-7.1&#34;&gt;CA-7(1)&lt;/a&gt;, &lt;a href=&#34;#ca-9&#34;&gt;CA-9&lt;/a&gt;, &lt;a href=&#34;#cm-2.2&#34;&gt;CM-2(2)&lt;/a&gt;, &lt;a href=&#34;#cm-3.1&#34;&gt;CM-3(1)&lt;/a&gt;, &lt;a href=&#34;#cm-3.4&#34;&gt;CM-3(4)&lt;/a&gt;, &lt;a href=&#34;#cm-4&#34;&gt;CM-4&lt;/a&gt;, &lt;a href=&#34;#cm-6&#34;&gt;CM-6&lt;/a&gt;, &lt;a href=&#34;#cm-6.1&#34;&gt;CM-6(1)&lt;/a&gt;, &lt;a href=&#34;#cm-7.2&#34;&gt;CM-7(2)&lt;/a&gt;, &lt;a href=&#34;#cm-7.4&#34;&gt;CM-7(4)&lt;/a&gt;, &lt;a href=&#34;#cm-7.5&#34;&gt;CM-7(5)&lt;/a&gt;, &lt;a href=&#34;#cm-8&#34;&gt;CM-8(all)&lt;/a&gt;, &lt;a href=&#34;#cm-9.1&#34;&gt;CM-9(1)&lt;/a&gt;, &lt;a href=&#34;#cm-10&#34;&gt;CM-10&lt;/a&gt;, &lt;a href=&#34;#cm-11&#34;&gt;CM-11&lt;/a&gt;, &lt;a href=&#34;#cp-7&#34;&gt;CP-7(all)&lt;/a&gt;, &lt;a href=&#34;#cp-8&#34;&gt;CP-8(all)&lt;/a&gt;, &lt;a href=&#34;#sc-43&#34;&gt;SC-43&lt;/a&gt;, &lt;a href=&#34;#si-2&#34;&gt;SI-2&lt;/a&gt;, &lt;a href=&#34;#si-3&#34;&gt;SI-3&lt;/a&gt;, &lt;a href=&#34;#si-4&#34;&gt;SI-4(all)&lt;/a&gt;, &lt;a href=&#34;#si-7&#34;&gt;SI-7&lt;/a&gt;, &lt;a href=&#34;#si-8&#34;&gt;SI-8&lt;/a&gt;.',
                141
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PL-10 Baseline Selection',
                'Select a control baseline for the system.',
                'low,moderate,high',
                'Control baselines are predefined sets of controls specifically assembled to address the protection needs of a group, organization, or community of interest. Controls are chosen for baselines to either satisfy mandates imposed by laws, executive orders, directives, regulations, policies, standards, and guidelines or address threats common to all users of the baseline under the assumptions specific to the baseline. Baselines represent a starting point for the protection of individuals’ privacy, information, and information systems with subsequent tailoring actions to manage risk in accordance with mission, business, or other constraints (see &lt;a href=&#34;#pl-11&#34;&gt;PL-11&lt;/a&gt;). Federal control baselines are provided in &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-53B&#34;&gt;SP 800-53B&lt;/a&gt;. The selection of a control baseline is determined by the needs of stakeholders. Stakeholder needs consider mission and business requirements as well as mandates imposed by applicable laws, executive orders, directives, policies, regulations, standards, and guidelines. For example, the control baselines in &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-53B&#34;&gt;SP 800-53B&lt;/a&gt; are based on the requirements from &lt;a href=&#34;https://www.congress.gov/113/plaws/publ283/PLAW-113publ283.pdf&#34;&gt;FISMA&lt;/a&gt; and &lt;a href=&#34;https://www.govinfo.gov/content/pkg/STATUTE-88/pdf/STATUTE-88-Pg1896.pdf&#34;&gt;PRIVACT&lt;/a&gt;. The requirements, along with the NIST standards and guidelines implementing the legislation, direct organizations to select one of the control baselines after the reviewing the information types and the information that is processed, stored, and transmitted on the system; analyzing the potential adverse impact of the loss or compromise of the information or system on the organization’s operations and assets, individuals, other organizations, or the Nation; and considering the results from system and organizational risk assessments. &lt;a href=&#34;https://www.cnss.gov/CNSS/issuances/Instructions.cfm&#34;&gt;CNSSI 1253&lt;/a&gt; provides guidance on control baselines for national security systems.',
                142
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);

        queryRunner.query(`WITH inserted_control AS (
            INSERT INTO standard_controls (standard_control_category_id, standard_id, name, description, risk_levels, implementation, order_index)
            VALUES (
                (SELECT id FROM standard_control_categories WHERE name = $1 LIMIT 1),
                (SELECT id FROM standards WHERE key = 'nist_800_53' LIMIT 1),
                'PL-11 Baseline Tailoring',
                'Tailor the selected control baseline by applying specified tailoring actions.',
                'low,moderate,high',
                'The concept of tailoring allows organizations to specialize or customize a set of baseline controls by applying a defined set of tailoring actions. Tailoring actions facilitate such specialization and customization by allowing organizations to develop security and privacy plans that reflect their specific mission and business functions, the environments where their systems operate, the threats and vulnerabilities that can affect their systems, and any other conditions or situations that can impact their mission or business success. Tailoring guidance is provided in &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-53B&#34;&gt;SP 800-53B&lt;/a&gt;. Tailoring a control baseline is accomplished by identifying and designating common controls, applying scoping considerations, selecting compensating controls, assigning values to control parameters, supplementing the control baseline with additional controls as needed, and providing information for control implementation. The general tailoring actions in &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-53B&#34;&gt;SP 800-53B&lt;/a&gt; can be supplemented with additional actions based on the needs of organizations. Tailoring actions can be applied to the baselines in &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-53B&#34;&gt;SP 800-53B&lt;/a&gt; in accordance with the security and privacy requirements from &lt;a href=&#34;https://www.congress.gov/113/plaws/publ283/PLAW-113publ283.pdf&#34;&gt;FISMA&lt;/a&gt;, &lt;a href=&#34;https://www.govinfo.gov/content/pkg/STATUTE-88/pdf/STATUTE-88-Pg1896.pdf&#34;&gt;PRIVACT&lt;/a&gt;, and &lt;a href=&#34;https://www.whitehouse.gov/sites/whitehouse.gov/files/omb/circulars/A130/a130revised.pdf&#34;&gt;OMB A-130&lt;/a&gt;. Alternatively, other communities of interest adopting different control baselines can apply the tailoring actions in &lt;a href=&#34;https://doi.org/10.6028/NIST.SP.800-53B&#34;&gt;SP 800-53B&lt;/a&gt; to specialize or customize the controls that represent the specific needs and concerns of those entities.',
                143
            )
            RETURNING id
        )
        SELECT * FROM inserted_control;`, [categoryName]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const categoryName = 'Planning';

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
