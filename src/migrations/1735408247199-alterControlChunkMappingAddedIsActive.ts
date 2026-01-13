import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterControlChunkMappingAddedIsActive1735408247199 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.control_chunk_mapping
            ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.control_chunk_mapping
            DROP COLUMN IF EXISTS is_active;
        `);
    }

}
