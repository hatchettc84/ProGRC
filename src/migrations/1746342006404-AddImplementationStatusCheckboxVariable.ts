import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImplementationStatusCheckboxVariable1746342006404 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            INSERT INTO template_variables (id, label, placeholder, type, group_id) VALUES (34, 'Implementation Status Checkboxes', '{{implementation_status_checkboxes}}', 'CONTROL', 9);
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DELETE FROM template_variables WHERE id = 34;
            `
        );
    }

}
