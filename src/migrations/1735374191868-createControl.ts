import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateControl1735374191868 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = 'control'
                ) THEN
                    CREATE TABLE public.control (
                        id SERIAL PRIMARY KEY,
                        framework_id INT NULL,
                        control_parent_id INT NULL,
                        control_name VARCHAR NOT NULL,
                        family_name VARCHAR NULL,
                        control_long_name VARCHAR NULL,
                        control_text TEXT NULL,
                        control_discussion TEXT NULL,
                        control_summary TEXT NULL,
                        source_control_mapping_emb VECTOR(128) NULL,
                        control_eval_criteria TEXT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                        active BOOLEAN DEFAULT true NULL,
                        source_control_mapping TEXT NULL
                    );
                END IF;
            END;
            $$;
        `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_indexes 
                    WHERE schemaname = 'public' AND tablename = 'control' 
                    AND indexname = 'control_source_control_mapping_emb_idx'
                ) THEN
                    CREATE INDEX control_source_control_mapping_emb_idx 
                    ON public.control USING ivfflat (source_control_mapping_emb);
                END IF;
            END;
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS control_source_control_mapping_emb_idx;
        `);

        await queryRunner.query(`
            DROP TABLE IF EXISTS public.control;
        `);
    }
}
