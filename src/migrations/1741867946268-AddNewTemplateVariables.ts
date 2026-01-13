import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewTemplateVariables1741867946268 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (31, 'App Auditors', '{{app_auditor}}', 'GLOBAL', 5);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (32, 'Standard Level Comments', '{{standard_comments}}', 'GLOBAL', 6);
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (33, 'Control Level Comments', '{{control_level_comments}}', 'CONTROL', 9);
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DELETE FROM template_variables WHERE id IN (31, 32, 33);
            `
        );
    }

}
