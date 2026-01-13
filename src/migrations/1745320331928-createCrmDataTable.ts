import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCrmDataTable1745320331928 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS crm_data (
                id SERIAL PRIMARY KEY,
                app_id INT NOT NULL,
                standard_id INT NOT NULL,
                customer_id VARCHAR(255) NOT NULL,
                control_id INT NOT NULL,
                crm_provider VARCHAR(255),
                crm_status VARCHAR(255),
                crm_parameters VARCHAR(255),
                crm_explanation TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await queryRunner.query(`
            ALTER TABLE app_standards 
            ADD COLUMN IF NOT EXISTS crm_file_path VARCHAR(255),
            ADD COLUMN IF NOT EXISTS is_crm_available BOOLEAN DEFAULT FALSE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS crm_data;
        `);

        await queryRunner.query(`
            ALTER TABLE app_standards 
            DROP COLUMN IF EXISTS crm_file_path,
            DROP COLUMN IF EXISTS is_available_crm;
        `);
    }

} 