import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAppStandardForHavePendingComplianceUpdate1730170447273 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE app_standards ADD COLUMN have_pending_compliance BOOLEAN DEFAULT FALSE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE app_standards DROP COLUMN have_pending_compliance`);
    }

}
