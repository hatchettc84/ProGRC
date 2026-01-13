import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeAssessmentCreatedByToUUID1728639683150 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE assessment_info
            ALTER COLUMN created_by
            SET DATA TYPE UUID
            USING created_by::UUID
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE assessment_info
            ALTER COLUMN created_by
            SET DATA TYPE VARCHAR
            USING created_by::VARCHAR
        `);
    }

}
