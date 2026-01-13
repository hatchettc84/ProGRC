import { MigrationInterface, QueryRunner } from "typeorm"

export class CreatePromptTemplateVariableTable1751400000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the prompt_template_variables table with all columns and constraints
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS prompt_template_variables (
                id SERIAL PRIMARY KEY,
                variable_name VARCHAR(255) UNIQUE NOT NULL,
                display_name VARCHAR(255) NOT NULL,
                description TEXT,
                prompt TEXT NOT NULL,
                context_source VARCHAR(500) NOT NULL,
                output_format TEXT NOT NULL,
                type VARCHAR(20) NOT NULL DEFAULT 'GLOBAL' 
                    CHECK (type IN ('GLOBAL', 'CONTROL_FAMILY', 'CONTROL')),
                group_id INT NOT NULL,
                specific_use_case BOOLEAN NOT NULL DEFAULT FALSE,
                input_parameters JSON,
                customer_id VARCHAR(255) NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_by VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Create indexes for better performance
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_prompt_variable_name ON prompt_template_variables(variable_name);
            CREATE INDEX IF NOT EXISTS idx_prompt_customer ON prompt_template_variables(customer_id);
            CREATE INDEX IF NOT EXISTS idx_prompt_type ON prompt_template_variables(type);
            CREATE INDEX IF NOT EXISTS idx_prompt_group ON prompt_template_variables(group_id);
            CREATE INDEX IF NOT EXISTS idx_prompt_specific_use_case ON prompt_template_variables(specific_use_case);
            CREATE INDEX IF NOT EXISTS idx_prompt_active ON prompt_template_variables(is_active);
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE prompt_template_variables 
            ADD CONSTRAINT fk_prompt_variable_customer 
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
        `);

        await queryRunner.query(`
            ALTER TABLE prompt_template_variables 
            ADD CONSTRAINT fk_prompt_variable_group 
            FOREIGN KEY (group_id) REFERENCES template_variable_group(id) ON DELETE CASCADE;
        `);

        // Extend template_variable_group table for customer groups
        await queryRunner.query(`
            ALTER TABLE template_variable_group 
            ADD COLUMN IF NOT EXISTS customer_id VARCHAR(36),
            ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT FALSE;
        `);

        // Add index for customer groups
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS idx_template_group_customer_custom 
            ON template_variable_group(customer_id, is_custom);
        `);

        // Add foreign key for customer-specific groups
        await queryRunner.query(`
            ALTER TABLE template_variable_group 
            ADD CONSTRAINT fk_template_group_customer 
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraints first
        await queryRunner.query(`
            ALTER TABLE prompt_template_variables 
            DROP CONSTRAINT IF EXISTS fk_prompt_variable_customer;
        `);
        
        await queryRunner.query(`
            ALTER TABLE prompt_template_variables 
            DROP CONSTRAINT IF EXISTS fk_prompt_variable_group;
        `);

        // Drop indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_prompt_variable_name;
            DROP INDEX IF EXISTS idx_prompt_customer;
            DROP INDEX IF EXISTS idx_prompt_type;
            DROP INDEX IF EXISTS idx_prompt_group;
            DROP INDEX IF EXISTS idx_prompt_specific_use_case;
            DROP INDEX IF EXISTS idx_prompt_active;
        `);

        // Drop the main table
        await queryRunner.query(`DROP TABLE IF EXISTS prompt_template_variables;`);

        // Revert template_variable_group changes
        await queryRunner.query(`
            ALTER TABLE template_variable_group 
            DROP CONSTRAINT IF EXISTS fk_template_group_customer;
        `);
        
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_template_group_customer_custom;
        `);
        
        await queryRunner.query(`
            ALTER TABLE template_variable_group 
            DROP COLUMN IF EXISTS customer_id,
            DROP COLUMN IF EXISTS is_custom;
        `);
    }
} 