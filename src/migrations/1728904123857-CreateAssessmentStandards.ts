import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAssessmentStandards1728904123857 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`CREATE TABLE "assessment_standards" (
            "assessment_id" uuid NOT NULL,
            "standard_id" integer NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            PRIMARY KEY ("assessment_id", "standard_id")
        )`);

        queryRunner.query(`INSERT INTO assessment_standards (assessment_id, standard_id) SELECT id, standard_id FROM assessment_info`);

        queryRunner.query(`ALTER TABLE assessment_info DROP COLUMN standard_id`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`ALTER TABLE assessment_info ADD COLUMN standard_id integer`);
        queryRunner.query(`UPDATE assessment_info SET standard_id = (SELECT standard_id FROM assessment_standards WHERE assessment_id = id)`);
        queryRunner.query(`DROP TABLE "assessment_standards"`);
    }

}
