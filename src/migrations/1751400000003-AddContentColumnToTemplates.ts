import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentColumnToTemplates1751400000003 implements MigrationInterface {
    name = 'AddContentColumnToTemplates1751400000003'

        public async up(queryRunner: QueryRunner): Promise<void> {
        // Add entity_type column to templates table if it doesn't exist
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'templates' 
                    AND column_name = 'entity_type'
                ) THEN
                    ALTER TABLE templates 
                    ADD COLUMN entity_type varchar(255) default 'assessment' NULL;
                END IF;
            END $$;
        `);

        // Update existing templates to have entity_type = 'assessment' where it's null
        await queryRunner.query(`
            UPDATE templates 
            SET entity_type = 'assessment' 
            WHERE entity_type IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove entity_type column from templates table if it exists
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'templates' 
                    AND column_name = 'entity_type'
                ) THEN
                    ALTER TABLE templates 
                    DROP COLUMN entity_type;
                END IF;
            END $$;
        `);
    }
} 