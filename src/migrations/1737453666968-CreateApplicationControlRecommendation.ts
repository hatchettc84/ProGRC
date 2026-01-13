import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApplicationControlRecommendation1737453666968 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "recommendation_status_enum" AS ENUM (
                'NEW',
                'ACKNOWLEDGED',
                'IMPLEMENTED',
                'N/A',
                'REJECTED',
                'ARCHIVED',
                'ACTIONED'
            );
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.application_control_recommendation
            (
                id SERIAL PRIMARY KEY,
                application_id INT NOT NULL,
                control_id INT NOT NULL,
                standard_id INT NOT NULL,
                recommendation TEXT NOT NULL,
                status recommendation_status_enum NOT NULL DEFAULT 'NEW',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.application_control_recommendation;
        `);

        await queryRunner.query(`
            DROP TYPE recommendation_status_enum;
        `);
    }

}
