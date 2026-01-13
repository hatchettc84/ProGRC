import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCompletionOnAppStandardControl1729255944811 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`ALTER TABLE app_standard_controls ADD COLUMN percentage_completion DECIMAL(5,2) DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`ALTER TABLE app_standard_controls DROP COLUMN percentage_completion`);
    }

}
