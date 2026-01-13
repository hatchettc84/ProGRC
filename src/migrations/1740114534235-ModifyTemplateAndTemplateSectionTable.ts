import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyTemplateAndTemplateSectionTable1740114534235 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            `
            CREATE TYPE "template_section_type" AS ENUM (
                'GLOBAL',
                'CONTROL_FAMILY',
                'CONTROL'
            );
            `
        );

        await queryRunner.query(
            `
            ALTER TABLE templates ADD COLUMN IF NOT EXISTS license_type_id integer DEFAULT 1 NOT NULL;
            ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE NOT NULL;
            ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_editable BOOLEAN DEFAULT FALSE NOT NULL;
            ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE NOT NULL;
            ALTER TABLE templates ADD COLUMN IF NOT EXISTS standard_ids integer[] default '{}' NOT NULL;
            ALTER TABLE templates ADD COLUMN IF NOT EXISTS created_by varchar(255);
            ALTER TABLE templates ADD COLUMN IF NOT EXISTS updated_by varchar(255);
            `
        );

        await queryRunner.query(
            `
            ALTER TABLE templates_section ADD COLUMN IF NOT EXISTS type template_section_type DEFAULT 'GLOBAL' NOT NULL;
            ALTER TABLE templates_section ADD COLUMN IF NOT EXISTS parent_id integer;
            ALTER TABLE templates_section ADD COLUMN IF NOT EXISTS is_looped BOOLEAN DEFAULT FALSE;
            ALTER TABLE templates_section ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL;
            ALTER TABLE templates_section ADD COLUMN IF NOT EXISTS created_by varchar(255);
            ALTER TABLE templates_section ADD COLUMN IF NOT EXISTS updated_by varchar(255);
            `
        );

        await queryRunner.query(
            `
            CREATE TABLE IF NOT EXISTS template_variable_group (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                parent_id integer,
                order_index integer,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL
            );

            CREATE TABLE IF NOT EXISTS template_variables (
                id SERIAL PRIMARY KEY,
                label VARCHAR(255) NOT NULL,
                placeholder VARCHAR(255) NOT NULL,
                type template_section_type NOT NULL,
                group_id integer,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL
            );
            `
        );

        // copy standard_id from each row and add it to standard_ids column in template table
        await queryRunner.query(
            `
            UPDATE templates
            SET standard_ids = ARRAY[standard_id]
            `
        );


    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(
            `
            DROP TABLE IF EXISTS template_variable_group;
            DROP TABLE IF EXISTS template_variables;
            `
        );

        await queryRunner.query(
            `
            ALTER TABLE templates DROP COLUMN IF EXISTS license_type_id;
            ALTER TABLE templates DROP COLUMN IF EXISTS is_published;
            ALTER TABLE templates DROP COLUMN IF EXISTS is_editable;
            ALTER TABLE templates DROP COLUMN IF EXISTS is_default;
            ALTER TABLE templates DROP COLUMN IF EXISTS standard_ids;
            ALTER TABLE templates DROP COLUMN IF EXISTS created_by;
            ALTER TABLE templates DROP COLUMN IF EXISTS updated_by;
            `
        );

        await queryRunner.query(
            `
            ALTER TABLE templates_section DROP COLUMN IF EXISTS type;
            ALTER TABLE templates_section DROP COLUMN IF EXISTS parent_id;
            ALTER TABLE templates_section DROP COLUMN IF EXISTS is_looped;
            ALTER TABLE templates_section DROP COLUMN IF EXISTS updated_at;
            ALTER TABLE templates_section DROP COLUMN IF EXISTS created_by;
            ALTER TABLE templates_section DROP COLUMN IF EXISTS updated_by;
            `
        );

        await queryRunner.query(
            `
            DROP TYPE template_section_type;
            `
        );
    }

}
