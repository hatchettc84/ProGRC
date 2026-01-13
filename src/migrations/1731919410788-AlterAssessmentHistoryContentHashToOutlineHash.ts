import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAssessmentHistoryContentHashToOutlineHash1731919410788 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "assessment_history" RENAME COLUMN "content_hash" TO "outline_hash";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            ALTER TABLE "assessment_history" RENAME COLUMN "outline_hash" TO "content_hash";
        `);
    }

}
