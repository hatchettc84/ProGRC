import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStandardControlMapping1735374742612 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.standard_control_mapping (
                id SERIAL PRIMARY KEY,
                standard_id INT NOT NULL,
                control_id INT NULL,
                additional_selection_parameters TEXT NULL,
                additional_guidance TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.standard_control_mapping;
        `);
    }

}
