import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterSourceChunksMapping1740482150295 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE source_chunk_mapping 
            ADD COLUMN IF NOT EXISTS customer_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS app_id INT,
            ADD COLUMN IF NOT EXISTS "limit" INT,
            ADD COLUMN IF NOT EXISTS "offset" INT;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE source_chunk_mapping 
            DROP COLUMN IF EXISTS customer_id,
            DROP COLUMN IF EXISTS app_id,
            DROP COLUMN IF EXISTS "limit",
            DROP COLUMN IF EXISTS "offset";
        `);
    }

}
