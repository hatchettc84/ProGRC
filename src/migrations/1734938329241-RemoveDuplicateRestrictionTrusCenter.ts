import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDuplicateRestrictionTrusCenter1734938329241 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE trust_centers DROP CONSTRAINT trust_centers_app_id_customer_id_assessment_id_key');

        await queryRunner.query('CREATE INDEX trust_centers_app_id_customer_id_assessment_id_idx ON trust_centers (app_id, customer_id, assessment_id)');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX trust_centers_app_id_customer_id_assessment_id_idx');

        await queryRunner.query('ALTER TABLE trust_centers ADD CONSTRAINT trust_centers_app_id_customer_id_assessment_id_key UNIQUE (app_id, customer_id, assessment_id)');
    }

}
