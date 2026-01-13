import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAssetsIdString1729585596932 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Step 1: Revert the 'id' column back to uuid
        await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "id" TYPE uuid USING "id"::uuid
        `);

        // Step 2: Change 'asset_id' from uuid to string (varchar)
        await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "asset_id" TYPE char(36) USING "asset_id"::char(36)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert 'id' back to char(36)
        await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "id" TYPE char(36) USING "id"::char(36)
        `);

        // Revert 'asset_id' back to uuid
        await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "asset_id" TYPE uuid USING "asset_id"::uuid
        `);

    }

}
