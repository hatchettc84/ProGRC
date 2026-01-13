import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeApplicationControlEvidence1735543126308 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE application_control_evidence ADD COLUMN application_control_mapping_id INT4;
            ALTER TABLE application_control_evidence DROP COLUMN app_id;
            ALTER TABLE application_control_evidence DROP COLUMN control_id;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE application_control_evidence ADD COLUMN app_id INT8;
            ALTER TABLE application_control_evidence ADD COLUMN control_id INT4;
            ALTER TABLE application_control_evidence DROP COLUMN application_control_mapping_id;
        `);
    }

}
