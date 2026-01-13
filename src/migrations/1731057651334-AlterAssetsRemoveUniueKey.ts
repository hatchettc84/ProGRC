import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAssetsRemoveUniueKey1731057651334 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE assets 
            DROP CONSTRAINT IF EXISTS idx_unique_asset_id_asset;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Re-add the unique constraint to the 'asset_id' column in case of rollback
        await queryRunner.query(`
            ALTER TABLE assets 
            ADD CONSTRAINT idx_unique_asset_id_asset UNIQUE (asset_id);
        `);
    }

}
