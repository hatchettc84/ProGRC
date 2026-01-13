import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSourceChunkMapping1735375121135 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.source_chunk_mapping (
                id SERIAL PRIMARY KEY,
                chunk_id VARCHAR(8) NOT NULL,
                source_id INT NOT NULL,
                chunk_text TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                chunk_emb public.vector NULL,
                matched_controls JSON NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.source_chunk_mapping;
        `);
    }

}
