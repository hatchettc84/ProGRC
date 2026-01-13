import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStandard1735374047204 implements MigrationInterface {


    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.standard (
                id SERIAL PRIMARY KEY,
                "name" VARCHAR NOT NULL,
                short_description TEXT NULL,
                long_description TEXT NULL,
                "path" TEXT NULL,
                labels TEXT[] NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                active BOOLEAN DEFAULT true,
                framework_id INT NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.standard;
        `);
    }

}
