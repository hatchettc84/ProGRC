import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUpdatedAtOnAssessment1729749617327 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessment_info" ADD "updated_at" TIMESTAMP DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "assessment_info" DROP COLUMN "updated_at"`);
    }

}
