import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAssessmentSchemaAddHashColumn1731657804478 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            ALTER TABLE "assessment_detail"
            RENAME TO "assessment";
        `);

        await queryRunner.query(`
            ALTER TABLE "assessment_outline"
            ADD COLUMN "outline_hash" VARCHAR(32) NULL;
        `);


        await queryRunner.query(`
            ALTER TABLE "assessment_history"
            ADD COLUMN "content_hash" VARCHAR(32) NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "assessment_sections"
            ADD COLUMN "content_hash" VARCHAR(32) NULL;
        `);

        await queryRunner.query(`
            ALTER TABLE "assessment_sections_history"
            ADD COLUMN "content_hash" VARCHAR(32) NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            ALTER TABLE "assessment"
            RENAME TO "assessment_detail";
        `);
        
          await queryRunner.query(`
            DROP TRIGGER IF EXISTS set_outline_hash ON "assessment_outline";
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS set_content_hash ON "assessment_history";
        `);


        await queryRunner.query(`
            DROP TRIGGER IF EXISTS set_content_hash ON "assessment_sections";
        `);

        await queryRunner.query(`
            DROP TRIGGER IF EXISTS set_content_hash ON "assessment_sections_history";
        `);

    }

}
