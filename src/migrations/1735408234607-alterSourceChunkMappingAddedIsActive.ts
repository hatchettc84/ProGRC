import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterSourceChunkMappingAddedIsActive1735408234607 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.source_chunk_mapping
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.source_chunk_mapping
            DROP COLUMN IF EXISTS is_active;
        `);

    }

}
