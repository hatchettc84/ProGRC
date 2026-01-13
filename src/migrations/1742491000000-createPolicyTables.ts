import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePolicyTables1742491000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create policy_template table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS policy_template (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                content JSONB NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(255) NULL,
                CONSTRAINT unique_template_name UNIQUE (name)
            );

            COMMENT ON TABLE policy_template IS 'Stores policy templates that can be reused across different policies';
    
        `);

        // Create policy_details table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS policy_details (
                id SERIAL PRIMARY KEY,
                policy_id INTEGER,
                standards JSONB,
                policy_name TEXT NOT NULL,
                version VARCHAR(50) NOT NULL,
                description TEXT,
                content JSONB NOT NULL,
                customer_id VARCHAR(255) NOT NULL,
                customer_name TEXT NOT NULL,
                sector TEXT,
                remarks TEXT,
                s3_url VARCHAR(255),
                is_locked BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                update_by VARCHAR(255) NOT NULL,
                CONSTRAINT fk_policy_template
                    FOREIGN KEY (policy_id)
                    REFERENCES policy_template(id)
                    ON DELETE CASCADE,
                CONSTRAINT unique_policy_name_per_customer UNIQUE (policy_name, customer_id),
                CONSTRAINT valid_version_format CHECK (version ~ '^[0-9]+\\.[0-9]+\\.[0-9]+$')
            );

            COMMENT ON TABLE policy_details IS 'Stores detailed information about policies created from templates';
    
        `);

        // Create indexes for better performance
        await queryRunner.query(`
            -- Indexes for policy_template
            CREATE INDEX IF NOT EXISTS idx_policy_template_name ON policy_template(name);
            CREATE INDEX IF NOT EXISTS idx_policy_template_created_at ON policy_template(created_at);

            -- Indexes for policy_details
            CREATE INDEX IF NOT EXISTS idx_policy_details_policy_id ON policy_details(policy_id);
            CREATE INDEX IF NOT EXISTS idx_policy_details_customer_id ON policy_details(customer_id);
            CREATE INDEX IF NOT EXISTS idx_policy_details_customer_name ON policy_details(customer_name);
            CREATE INDEX IF NOT EXISTS idx_policy_details_version ON policy_details(version);
            CREATE INDEX IF NOT EXISTS idx_policy_details_created_at ON policy_details(created_at);
            CREATE INDEX IF NOT EXISTS idx_policy_details_updated_at ON policy_details(updated_at);
        `);

        // Create trigger to automatically update updated_at timestamp
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            CREATE TRIGGER update_policy_template_updated_at
                BEFORE UPDATE ON policy_template
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();

            CREATE TRIGGER update_policy_details_updated_at
                BEFORE UPDATE ON policy_details
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop triggers first
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_policy_details_updated_at ON policy_details;
            DROP TRIGGER IF EXISTS update_policy_template_updated_at ON policy_template;
            DROP FUNCTION IF EXISTS update_updated_at_column();
        `);

        // Drop indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_policy_details_updated_at;
            DROP INDEX IF EXISTS idx_policy_details_created_at;
            DROP INDEX IF EXISTS idx_policy_details_version;
            DROP INDEX IF EXISTS idx_policy_details_customer_name;
            DROP INDEX IF EXISTS idx_policy_details_customer_id;
            DROP INDEX IF EXISTS idx_policy_details_policy_id;
            DROP INDEX IF EXISTS idx_policy_template_created_at;
            DROP INDEX IF EXISTS idx_policy_template_name;
        `);

        // Drop tables
        await queryRunner.query(`
            DROP TABLE IF EXISTS policy_details;
            DROP TABLE IF EXISTS policy_template;
        `);
    }
} 