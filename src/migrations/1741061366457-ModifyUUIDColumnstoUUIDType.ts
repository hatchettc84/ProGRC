import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyUUIDColumnstoUUIDType1741061366457 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE templates ALTER COLUMN updated_by TYPE uuid USING updated_by::uuid::uuid;
            ALTER TABLE templates ALTER COLUMN created_by TYPE uuid USING created_by::uuid::uuid;
            ALTER TABLE templates_section ALTER COLUMN updated_by TYPE uuid USING updated_by::uuid::uuid;
            ALTER TABLE templates_section ALTER COLUMN created_by TYPE uuid USING created_by::uuid::uuid;
            ALTER TABLE templates_section ALTER COLUMN section_id TYPE uuid USING section_id::uuid::uuid;
            ALTER TABLE application_control_evidence ALTER COLUMN uuid SET DATA TYPE UUID USING uuid::uuid;
            ALTER TABLE source ALTER COLUMN uuid SET DATA TYPE UUID USING uuid::uuid;
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            ALTER TABLE templates ALTER COLUMN updated_by TYPE varchar(255) USING updated_by::varchar(255);
            ALTER TABLE templates ALTER COLUMN created_by TYPE varchar(255) USING created_by::varchar(255);
            ALTER TABLE templates_section ALTER COLUMN updated_by TYPE varchar(255) USING updated_by::varchar(255);
            ALTER TABLE templates_section ALTER COLUMN created_by TYPE varchar(255) USING created_by::varchar(255);
            ALTER TABLE templates_section ALTER COLUMN section_id TYPE varchar(36) USING section_id::varchar(36);
            ALTER TABLE application_control_evidence ALTER COLUMN uuid SET DATA TYPE varchar(255) USING uuid::varchar(255);
            ALTER TABLE source ALTER COLUMN uuid SET DATA TYPE varchar(255) USING uuid::varchar(255);
            `
        );
    }

}
