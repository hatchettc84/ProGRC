import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTemplateAndAssessmentTablesForExcelUpload1746180281949 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "templates" ADD COLUMN "temp_location" varchar(255);
            ALTER TABLE "templates" ADD COLUMN "type" varchar default 'word';
            ALTER TABLE "templates" ADD COLUMN "is_available" boolean default false;
            ALTER TABLE "templates" ADD COLUMN "is_locked" boolean default false;
            ALTER TABLE "templates" ADD COLUMN "llm_enabled" boolean default false;
            ALTER TABLE "assessment" ADD COLUMN "location" varchar(255);
            ALTER TABLE "assessment" ADD COLUMN "temp_location" varchar(255);
            ALTER TABLE "assessment" ADD COLUMN "type" varchar default 'word';
            ALTER TABLE "assessment_history" ADD COLUMN "location" varchar(255);
        `);

        await queryRunner.query(`
            UPDATE "templates" SET "is_available" = true;
            UPDATE "templates" SET "type" = 'word';
            UPDATE "assessment" SET "type" = 'word';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "template" DROP COLUMN "temp_location";
            ALTER TABLE "template" DROP COLUMN "type";
            ALTER TABLE "template" DROP COLUMN "is_available";
            ALTER TABLE "template" DROP COLUMN "llm_enabled";
            ALTER TABLE "template" DROP COLUMN "is_locked";
            ALTER TABLE "assessment" DROP COLUMN "location";
            ALTER TABLE "assessment" DROP COLUMN "temp_location";
            ALTER TABLE "assessment" DROP COLUMN "type";
            ALTER TABLE "assessment_history" DROP COLUMN "location";
        `);
    }

}
