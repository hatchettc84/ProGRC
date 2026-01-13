import { MigrationInterface, QueryRunner } from "typeorm";

export class DBModificationForTrialAccounts1741162112333 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
              CREATE TABLE IF NOT EXISTS license_rules (
                id SERIAL PRIMARY KEY,
                license_type_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                number_of_applications INT NOT NULL DEFAULT 0,
                number_of_assessments INT NOT NULL DEFAULT 0,
                standards_per_application INT NOT NULL DEFAULT 0,
                available_standards JSONB NOT NULL DEFAULT '[]',
                available_templates JSONB NOT NULL DEFAULT '[]',
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
              );
            `
        );

        await queryRunner.query(
            
            `
            CREATE TYPE "api_method" AS ENUM (
                'GET',
                'PUT',
                'POST',
                'PATCH',
                'DELETE',
                'OPTIONS'
            );
            CREATE TABLE IF NOT EXISTS permissions (
                id SERIAL PRIMARY KEY,
                api_path TEXT NOT NULL,
                method api_method NOT NULL,
                allowed_licenses JSONB NOT NULL DEFAULT '[]',
                allowed_roles JSONB NOT NULL DEFAULT '[]',
                allow_all BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT permissions_api_path_method_unique UNIQUE (api_path, method)                
            );
            `
        );

        await queryRunner.query(
            `
            INSERT INTO license_type (id, name, created_at, updated_at) VALUES
            (6, 'Trial', NOW(), NOW()),
            (7, 'Expired', NOW(), NOW());            
            `
        );

        await queryRunner.query(
            `
            ALTER TABLE CUSTOMERS ADD COLUMN IF NOT EXISTS license_type_id integer DEFAULT 1 NOT NULL;
            ALTER TABLE CUSTOMERS ADD COLUMN IF NOT EXISTS license_start_date TIMESTAMP WITHOUT TIME ZONE;
            ALTER TABLE CUSTOMERS ADD COLUMN IF NOT EXISTS license_end_date TIMESTAMP WITHOUT TIME ZONE;
            ALTER TABLE CUSTOMERS ADD COLUMN IF NOT EXISTS enable_calendly BOOLEAN DEFAULT FALSE;
            ALTER TABLE CUSTOMERS ADD COLUMN IF NOT EXISTS calendly_url VARCHAR(255);
            `
        );

        await queryRunner.query(
            `
            UPDATE CUSTOMERS SET license_type_id = (select id from license_type where name = license_type), license_start_date = NOW(), license_end_date = NOW() + INTERVAL '1 year';
            `
        );

        await queryRunner.query(
            `
            INSERT INTO user_roles (id, role_name, is_org_role) VALUES
            (6, 'CSM AUDITOR', false),
            (7, 'AUDITOR', true);
            `
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DROP TABLE IF EXISTS license_rules;
            DROP TABLE IF EXISTS permissions;
            DROP TYPE IF EXISTS api_method;
            `
        );

        await queryRunner.query(
            `
            DELETE FROM license_type WHERE name IN ('Trial', 'Expired');
            `
        );

        await queryRunner.query(
            `
            ALTER TABLE CUSTOMERS DROP COLUMN IF EXISTS license_type_id;
            ALTER TABLE CUSTOMERS DROP COLUMN IF EXISTS license_start_date;
            ALTER TABLE CUSTOMERS DROP COLUMN IF EXISTS license_end_date;
            ALTER TABLE CUSTOMERS DROP COLUMN IF EXISTS enable_calendly;
            ALTER TABLE CUSTOMERS DROP COLUMN IF EXISTS calendly_url;
            `
        );

        await queryRunner.query(
            `
            DELETE FROM user_roles WHERE id IN (6,7);
            `
        );
    }

}
