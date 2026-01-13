import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUniqueAssetIdOnAsset1730118029845 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE UNIQUE INDEX "idx_unique_asset_id_asset" ON "assets" ("asset_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "idx_unique_asset_id_asset"
        `);
    }

}
