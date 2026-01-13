import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAssetTable1728974707317 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure the pgvector extension is enabled
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

        await queryRunner.query(`
      CREATE TABLE "assets" (
        "id" uuid NOT NULL,
        "source_type" varchar NOT NULL,
        "source_version" uuid NOT NULL,
        "asset_id" uuid NOT NULL,
        "asset_name" varchar NOT NULL,
        "asset_summary" text NOT NULL,
        "embeddings_small" vector(1536) NOT NULL, -- Define the dimension size for embeddings
        "embeddings_large" vector(3072) NOT NULL, -- Define the dimension size for embeddings
        "created_at" timestamp NOT NULL DEFAULT now(),     -- Timestamp for creation
        "updated_at" timestamp NOT NULL DEFAULT now(),      -- Timestamp for last update
        CONSTRAINT "PK_d756c84a848c44e3be0a3df1809" PRIMARY KEY ("id")
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "assets";`);
    }

}
