import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSourceV11735375260033 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.source_v1 (
                customer_id VARCHAR(255) NOT NULL,
                app_id INT8 NOT NULL,
                "data" JSON NOT NULL,
                created_at TIMESTAMP DEFAULT now() NOT NULL,
                updated_at TIMESTAMP DEFAULT now() NOT NULL,
                "name" VARCHAR NULL,
                summary VARCHAR NULL,
                is_active BOOLEAN DEFAULT true NOT NULL,
                created_by UUID NULL,
                updated_by UUID NULL,
                id SERIAL PRIMARY KEY,
                source_type INT4 NOT NULL,
                current_version INT4 NULL,
                is_deleted BOOLEAN DEFAULT false NOT NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.source_v1;
        `);
    }

}
