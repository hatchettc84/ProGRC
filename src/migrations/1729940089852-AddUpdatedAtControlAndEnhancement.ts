import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUpdatedAtControlAndEnhancement1729940089852 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE app_standard_controls ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE app_standard_controls DROP COLUMN updated_at`);
    }

}
