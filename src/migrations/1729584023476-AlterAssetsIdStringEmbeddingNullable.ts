import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterAssetsIdStringEmbeddingNullable1729584023476 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "id" TYPE char(36) USING "id"::char(36)
        `);
        
        // Ensure that the 'id' column is unique
        await queryRunner.query(`
            ALTER TABLE "assets"
            ADD CONSTRAINT "UQ_assets_id" UNIQUE ("id")
        `);

        // Step 2: Make 'embeddings_small' nullable
        await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "embeddings_small" DROP NOT NULL
        `);

        // Step 3: Make 'embeddings_large' nullable
        await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "embeddings_large" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the 'id' column back to uuid and drop the unique constraint
        await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "id" TYPE uuid USING "id"::uuid
        `);
        await queryRunner.query(`
            ALTER TABLE "assets"
            DROP CONSTRAINT "UQ_assets_id"
        `);

        // Revert 'embeddings_small' to be NOT NULL
        await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "embeddings_small" SET NOT NULL
        `);

        // Revert 'embeddings_large' to be NOT NULL
        await queryRunner.query(`
            ALTER TABLE "assets"
            ALTER COLUMN "embeddings_large" SET NOT NULL
        `);
    }

}
