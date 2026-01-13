import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApplicationControlEvidance1735375445923 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.application_control_evidence (
                id SERIAL PRIMARY KEY,
                app_id INT8 NOT NULL,
                control_id INT4 NOT NULL,
                "document" VARCHAR NOT NULL,
                description TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT now() NULL,
                updated_at TIMESTAMP DEFAULT now() NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.application_control_evidence;
        `);
    }
}
