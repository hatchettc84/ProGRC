import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTemplateSectionVariableGroupsAndVariable1740545886516 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            `
            ALTER TABLE templates ADD COLUMN IF NOT EXISTS customer_ids integer[] default '{}' NOT NULL;
            `
        );

        await queryRunner.query(
            `
            ALTER TABLE templates_section ADD CONSTRAINT templates_section_section_id_unique UNIQUE (section_id);
            `
        );

        await queryRunner.query(
            `
            INSERT INTO template_variable_group (id, name, order_index) VALUES (1, 'Organization', 1);
            INSERT INTO template_variable_group (id, name, order_index) VALUES (2, 'Users', 2);
            INSERT INTO template_variable_group (id, parent_id, name, order_index) VALUES (3, 2, 'Current User', 1);
            INSERT INTO template_variable_group (id, parent_id, name, order_index) VALUES (4, 2, 'Current Org Admin', 2);
            INSERT INTO template_variable_group (id, name, order_index) VALUES (5, 'Application', 3);
            INSERT INTO template_variable_group (id, parent_id, name, order_index) VALUES (6, 5, 'Standard', 1);
            INSERT INTO template_variable_group (id, name, order_index) VALUES (7, 'Compliance', 4);
            INSERT INTO template_variable_group (id, parent_id, name, order_index) VALUES (8, 7, 'Control Families', 1);
            INSERT INTO template_variable_group (id, parent_id, name, order_index) VALUES (9, 7, 'Control', 2);
            INSERT INTO template_variable_group (id, name, order_index) VALUES (10, 'General', 5);


            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (1, 'Organization Name', '{{org_name}}', 'GLOBAL', 1);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (2, 'Organization Logo', '{{org_logo}}', 'GLOBAL', 1);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (3, 'Kovr Logo', '{{kovr_logo}}', 'GLOBAL', 10);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (4, 'Assessment Version', '{{assessment_version}}', 'GLOBAL', 10);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (5, 'Assessment Updated Date', '{{assessment_updated_date}}', 'GLOBAL', 10);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (6, 'App Name', '{{app_name}}', 'GLOBAL', 5);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (7, 'Organization Designated CSM', '{{org_designated_csm}}', 'GLOBAL', 1);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (8, 'App Description', '{{app_description}}', 'GLOBAL', 5);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (9, 'Standard Name', '{{standard_name}}', 'GLOBAL', 6);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (10, 'Total Controls', '{{total_controls_in_standard}}', 'GLOBAL', 6);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (11, 'Total Implemented Controls', '{{total_implemented_controls}}', 'GLOBAL', 6);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (12, 'Total Partially Implemented Controls', '{{total_partially_implemented_controls}}', 'GLOBAL', 6);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (13, 'Total Not Implemented Controls', '{{total_not_implemented_controls}}', 'GLOBAL', 6);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (14, 'Total Excepted Controls', '{{total_excepted_controls}}', 'GLOBAL', 6);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (15, 'Control Family Name', '{{control_family_name}}', 'CONTROL_FAMILY', 8);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (16, 'Control Short Name', '{{control_id}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (17, 'Control Long Name', '{{control_name}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (18, 'Control Text', '{{control_text}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (19, 'Organization Name', '{{control_discussion}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (20, 'Organization Name', '{{control_additional_params}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (21, 'App Admin', '{{app_admin}}', 'GLOBAL', 5);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (22, 'Admin Responsibility', '{{responsibility}}', 'GLOBAL', 5);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (23, 'Implementation Status', '{{implementation_status}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (24, 'Implementation Explanation', '{{implementation_explanation}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (25, 'Control Exception', '{{control_exception}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (26, 'List of referenced source', '{{list_of_referenced_sources}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (27, 'List of evidences', '{{list_of_evidences}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (28, 'Recommendation plan table', '{{recommendation_plan_table}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (29, 'Control Section Title', '{{control_section_title}}', 'CONTROL', 9);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (30, 'Control Family Section Title', '{{control_family_section_title}}', 'CONTROL_FAMILY', 8);
            `
        );

        await queryRunner.query(
            `
                        
            UPDATE templates_section set html_content = '<p>{{kovr_logo}}</p>
<h1>Kovr Initial Assessment &amp; Plan Report</h1>
<p>This report provides a summary review of the system’s level of readiness to complete the FedRAMP® System Security Plan (SSP): Appendix A. It is an interim report that we will use to gather data, identify gaps, and prepare to implement controls for the full assessment. </p>
<p><strong>for</strong>  </p>
<p>{{org_logo}} </p>
<p><strong>Organization:</strong> {{org_name}}</p>
<p><strong>System:</strong> {{app_name}}</p>
<p><strong>Prepared By:</strong> {{org_name}}</p>
<p><strong>Report Version:</strong> {{assessment_version}}</p>
<p><strong>Prepared on:</strong> {{assessment_updated_date}}</p>
<p><strong>Kovr CSM:</strong> {{org_designated_csm}}</p>' where template_id = 4 and section_id = '422d352c-27f4-4bcc-a79c-e214d0accb13';
            `);

        await queryRunner.query(
            `
            UPDATE templates_section set html_content = '<h1>Executive Summary</h1>
<h2>{{app_name}}</h2>
<p><strong>Description:</strong> {{app_description}}</p>
<p><strong>Compliance Standard:</strong> {{standard_name}}</p>
<p><strong>Controls:</strong> {{total_controls_in_standard}} </p>
<p><strong>Implemented:</strong> {{total_implemented_controls}}</p>
<p><strong>Partially Implemented:</strong> {{total_partially_implemented_controls}}</p>
<p><strong>Not Implemented:</strong> {{total_not_implemented_controls}} </p>
<p><strong>Excepted Controls:</strong> {{total_excepted_controls}}</p>' where template_id = 4 and section_id = 'fdafe850-400b-43f1-a48a-be6f579c2b61';
            `);

        await queryRunner.query(
            `
            UPDATE templates_section set html_content = '<h1>Documented and Assessed Control</h1>
<h2>{{control_family_name}}</h2>
<h3>{{control_id}} {{control_name}}</h3>
<h4>{{control_id}} Control Discussion</h4>
<p>{{control_text}}</p>
<h4>{{control_id}} Control Requirement(s)</h4>
<p>{{control_discussion}}</p>
<h4>{{control_id}} Additional Control Requirement(s)</h4>
<p>{{control_additional_params}}</p>
<h4>{{control_id}} Control Assessment Results</h4>
<p><strong>Responsible Role:</strong>  {{app_admin}}</p>
<p><strong>Responsibility:</strong>  {{responsibility}}</p>
<p><strong>Implementation Status:</strong>  {{implementation_status}}</p>
<p><strong>Implementation Description:</strong><p>
<p>{{implementation_explanation}}</p>
<p><strong>Exceptions:</strong> {{control_exception}} </p>
<p><strong>Artifacts:</strong> These are files that were uploaded by the user to explain the implementation of the control. Detailed references for these sources are available by request or throug the Kovr.ai application. 
{{list_of_referenced_sources}}</p>
<p><strong>Evidences:</strong> These evidences were uploaded by the user to explain their implementation of the control.
{{list_of_evidences}}</p>
<h4>{{control_id}} Remediation Plan</h4>
<p>The following is a list of recommendations generated by the Kovr. ai application and whether the user has accepted each recommendation. 
{{recommendation_plan_table}}</p>' where template_id = 4 and section_id = 'c7b0881c-8187-40f1-8801-66f273d84332';
            `);
        
        await queryRunner.query(
            `
            INSERT INTO templates (id,name,upload_date,update_date,outline,is_default,standard_ids) VALUES(5,'Kovr Custom Editable Template',now(),now(),'[{"section_id":"422d352c-27f4-4bcc-a79c-e214d0accb13","children":[],"level":1,"search_key":"0","version":0},{"section_id":"fdafe850-400b-43f1-a48a-be6f579c2b61","children":[],"level":1,"search_key":"1","version":0},{"section_id":"c7b0881c-8187-40f1-8801-66f273d84332","children":[{"section_id":"482071c1-39a8-4810-b594-cdbb9ebbab3b","children":[{"section_id":"b7583545-fb39-4b9e-a0f7-10f70a9cefaf","children":[],"level":3,"search_key":"2_1_1","version":0}],"level":2,"search_key":"2_1","version":0}],"level":1,"search_key":"2","version":0}]',true,ARRAY[1,5]);
            `
        );

        await queryRunner.query(
            `
                        INSERT INTO public.templates_section
(template_id, title, section_id, html_content, created_at, is_active, parent_id, is_looped)
VALUES(5, 'Kovr Initial Assessment & Plan Report', 'e0e6089f-485f-4467-bc9f-b5b52ad7ee89', '<p>{{kovr_logo}}</p>
<h1>Kovr Initial Assessment &amp; Plan Report</h1>
<p>This report provides a summary review of the system’s level of readiness to complete the FedRAMP® System Security Plan (SSP): Appendix A. It is an interim report that we will use to gather data, identify gaps, and prepare to implement controls for the full assessment. </p>
<p><strong>for</strong>  </p>
<p>{{org_logo}} </p>
<p><strong>Organization:</strong> {{org_name}}</p>
<p><strong>System:</strong> {{app_name}}</p>
<p><strong>Prepared By:</strong> {{org_name}}</p>
<p><strong>Report Version:</strong> {{assessment_version}}</p>
<p><strong>Prepared on:</strong> {{assessment_updated_date}}</p>
<p><strong>Kovr CSM:</strong> {{org_designated_csm}}</p>', now(), true, NULL, false),
        (5, 'Executive Summary', '0165993f-3cd4-4320-a40c-1a6677587daa', '<h1>Executive Summary</h1>
<h2>{{app_name}}</h2>
<p><strong>Description:</strong> {{app_description}}</p>
<p><strong>Compliance Standard:</strong> {{standard_name}}</p>
<p><strong>Controls:</strong> {{total_controls_in_standard}} </p>
<p><strong>Implemented:</strong> {{total_implemented_controls}}</p>
<p><strong>Partially Implemented:</strong> {{total_partially_implemented_controls}}</p>
<p><strong>Not Implemented:</strong> {{total_not_implemented_controls}} </p>
<p><strong>Excepted Controls:</strong> {{total_excepted_controls}}</p>', now(), true, NULL, false),
            (5, 'Report', '816e5573-2d17-4a74-b298-9bbcdb8a277c', '<h1>Documented and Assessed Control</h1>', now(), true, NULL, false);
            `);

            await queryRunner.query(
                `
                INSERT INTO templates_section (template_id, title, section_id, html_content, created_at, is_active, parent_id, is_looped)
                VALUES (
                    5,
                    '{{control_family_section_title}}',
                    '482071c1-39a8-4810-b594-cdbb9ebbab3b',
                    '<h2>{{control_family_name}}</h2>',
                    now(),
                    true,
                    (SELECT id FROM templates_section WHERE template_id = 5 AND section_id = '816e5573-2d17-4a74-b298-9bbcdb8a277c'),
                    true
                );
                `
            );

        await queryRunner.query(
            `
            INSERT INTO templates_section (template_id, title, section_id, html_content, created_at, is_active, parent_id, is_looped) VALUES (5, '{{control_section_title}}', 'b7583545-fb39-4b9e-a0f7-10f70a9cefaf', '<h3>{{control_id}} {{control_name}}</h3>
<h4>{{control_id}} Control Discussion</h4>
<p>{{control_text}}</p>
<h4>{{control_id}} Control Requirement(s)</h4>
<p>{{control_discussion}}</p>
<h4>{{control_id}} Additional Control Requirement(s)</h4>
<p>{{control_additional_params}}</p>
<h4>{{control_id}} Control Assessment Results</h4>
<p><strong>Responsible Role:</strong>  {{app_admin}}</p>
<p><strong>Responsibility:</strong>  {{responsibility}}</p>
<p><strong>Implementation Status:</strong>  {{implementation_status}}</p>
<p><strong>Implementation Description:</strong><p>
<p>{{implementation_explanation}}</p>
<p><strong>Exceptions:</strong> {{control_exception}} </p>
<p><strong>Artifacts:</strong> These are files that were uploaded by the user to explain the implementation of the control. Detailed references for these sources are available by request or throug the Kovr.ai application. 
{{list_of_referenced_sources}}</p>
<p><strong>Evidences:</strong> These evidences were uploaded by the user to explain their implementation of the control.
{{list_of_evidences}}</p>
<h4>{{control_id}} Remediation Plan</h4>
<p>The following is a list of recommendations generated by the Kovr. ai application and whether the user has accepted each recommendation. 
{{recommendation_plan_table}}</p>', now(), true, (select id from templates_section where template_id = 5 and section_id = '482071c1-39a8-4810-b594-cdbb9ebbab3b'), true);
            `
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            `UPDATE templates_section set html_content = '<p>{{kovr_logo}}</p>
<h1>Kovr Initial Assessment &amp; Plan Report</h1>
<p>This report provides a summary review of the system’s level of readiness to complete the FedRAMP® System Security Plan (SSP): Appendix A. It is an interim report that we will use to gather data, identify gaps, and prepare to implement controls for the full assessment. </p>
<p><strong>for</strong>  </p>
<p>{{org_logo}} </p>
<p><strong>Organization:</strong> {{org_name}}</p>
<p><strong>System:</strong> {{app_name}}</p>
<p><strong>Prepared By:</strong> {{org_name}}</p>
<p><strong>Report Version:</strong> {{assessment_version}}</p>
<p><strong>Prepared on:</strong> {{assessment_updated_date}}</p>
<p><strong>Kovr CSM:</strong> {{org_designated_csm}}</p>' where template_id = 4 and section_id = '422d352c-27f4-4bcc-a79c-e214d0accb13';
            
            UPDATE templates_section set html_content = '<h1>Executive Summary</h1>
<h2>{{app_name}}</h2>
<p><strong>Description:</strong> {{app_description}}</p>
<p><strong>Compliance Standard:</strong> {{standard_name}}</p>
<p><strong>Controls:</strong> {{total_controls_in_standard}} </p>
<p><strong>Implemented:</strong> {{total_implemented_controls}}</p>
<p><strong>Partially Implemented:</strong> {{total_partially_implemented_controls}}</p>
<p><strong>Not Implemented:</strong> {{total_not_implemented_controls}} </p>
<p><strong>Excepted Controls:</strong> {{total_excepted_controls}}</p>' where template_id = 4 and section_id = 'fdafe850-400b-43f1-a48a-be6f579c2b61';
            
        UPDATE templates_section set html_content = '<h1>Documented and Assessed Control</h1>
<h2>{{control_family_name}}</h2>
<h3>{{control_id}} {control_name}</h3>
<h4>{{control_id}} Control Discussion</h4>
<p>{{control_text}}</p>
<h4>{{control_id}} Control Requirement(s)</h4>
<p>{{control_discussion}}</p>
<h4>{{control_id}} Additional Control Requirement(s)</h4>
<p>{{control_additional_params}}</p>
<h4>{{control_id}} Control Assessment Results</h4>
<p><strong>Responsible Role:</strong>  {{app_admin}}</p>
<p><strong>Responsibility:</strong>  {{responsibility}}</p>
<p><strong>Implementation Status:</strong>  {{implementation_status}}</p>
<p><strong>Implementation Description:</strong><p>
<p>{{implementation_explanation}}</p>
<p><strong>Exceptions:</strong> {{control_exception}} </p>
<p><strong>Artifacts:</strong> These are files that were uploaded by the user to explain the implementation of the control. Detailed references for these sources are available by request or throug the Kovr.ai application. 
{{list_of_referenced_sources}}</p>
<p><strong>Evidences:</strong> These evidences were uploaded by the user to explain their implementation of the control.
{{list_of_evidences}}</p>
<h4>{{control_id}} Remediation Plan</h4>
<p>The following is a list of recommendations generated by the Kovr. ai application and whether the user has accepted each recommendation. 
{{recommendation_plan_table}}</p>' where template_id = 4 and section_id = 'c7b0881c-8187-40f1-8801-66f273d84332';
        
        DELETE FROM templates_section WHERE template_id = 5;
        DELETE FROM templates WHERE id = 5;
        `);

        await queryRunner.query(`
            DELETE FROM template_variables;
            DELETE FROM template_variable_group;
        `);

        await queryRunner.query(`
            ALTER TABLE templates_section DROP CONSTRAINT templates_section_section_id_unique;
        `);

        await queryRunner.query(`
            ALTER TABLE templates DROP COLUMN IF EXISTS customer_ids;
        `);

    }

}
