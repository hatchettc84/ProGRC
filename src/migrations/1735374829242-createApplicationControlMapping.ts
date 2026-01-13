import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApplicationControlMapping1735374829242 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.application_control_mapping (
                id SERIAL PRIMARY KEY,
                control_id INT NOT NULL,
                implementation_status VARCHAR(255) NULL,
                implementation_explanation JSON NULL,
                implementation_explanation_emb JSON NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                app_id INT NULL,
                standard_id INT NULL,
                risk_level VARCHAR NULL,
                is_excluded BOOLEAN NULL,
                exception_reason TEXT NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.application_control_mapping;
        `);
    }

}
