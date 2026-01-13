import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAppSoftDelete1728976080301 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE app ADD COLUMN deleted_at timestamp`);
        await queryRunner.query(`ALTER TABLE app_users ADD COLUMN deleted_at timestamp`);
        await queryRunner.query(`ALTER TABLE assessment_info ADD COLUMN deleted_at timestamp`);
        await queryRunner.query(`ALTER TABLE source ADD COLUMN deleted_at timestamp`);
        await queryRunner.query(`ALTER TABLE async_tasks ADD COLUMN deleted_at timestamp`);
        await queryRunner.query(`ALTER TABLE app_assets ADD COLUMN deleted_at timestamp`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE app DROP COLUMN deleted_at`);
        await queryRunner.query(`ALTER TABLE app_users DROP COLUMN deleted_at`);
        await queryRunner.query(`ALTER TABLE assessment_info DROP COLUMN deleted_at`);
        await queryRunner.query(`ALTER TABLE source DROP COLUMN deleted_at`);
        await queryRunner.query(`ALTER TABLE async_tasks DROP COLUMN deleted_at`);
        await queryRunner.query(`ALTER TABLE app_assets DROP COLUMN deleted_at`);
    }

}
