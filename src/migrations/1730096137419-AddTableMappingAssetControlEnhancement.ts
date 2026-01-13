import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableMappingAssetControlEnhancement1730096137419 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            CREATE TABLE IF NOT EXISTS asset_controls (
                app_control_id uuid NOT NULL,
                app_control_enhancement_id uuid,
                asset_id uuid NOT NULL,
                created_at timestamp DEFAULT now(),
                PRIMARY KEY (app_control_id, app_control_enhancement_id, asset_id)
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            DROP TABLE IF EXISTS asset_controls;
        `);
    }

}
