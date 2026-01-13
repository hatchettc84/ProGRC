import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFramework1735373912325 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.framework (
                id SERIAL PRIMARY KEY,
                "name" VARCHAR NOT NULL,
                description TEXT NULL,
                "path" TEXT NULL,
                "version" INT NULL,
                created_at TIMESTAMP NULL,
                updated_at TIMESTAMP NULL,
                active BOOLEAN DEFAULT true
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.framework;
        `);
    }

}
