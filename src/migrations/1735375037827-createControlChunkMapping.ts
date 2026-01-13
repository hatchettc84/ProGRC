import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateControlChunkMapping1735375037827 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.control_chunk_mapping (
                id SERIAL PRIMARY KEY,
                app_id INT NOT NULL,
                control_id INT NOT NULL,
                chunk_id VARCHAR(8) NOT NULL,
                reference_data JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.control_chunk_mapping;
        `);
    }


}
