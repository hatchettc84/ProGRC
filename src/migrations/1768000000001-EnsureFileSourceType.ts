import { MigrationInterface, QueryRunner } from "typeorm";

export class EnsureFileSourceType1768000000001 implements MigrationInterface {
    name = 'EnsureFileSourceType1768000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure FILE SourceType exists - required for file uploads
        // Use INSERT ... ON CONFLICT or WHERE NOT EXISTS to avoid duplicates
        await queryRunner.query(`
            INSERT INTO source_types (name, created_at, updated_at, template_schema, source_count, assets_count)
            SELECT 'FILE', NOW(), NOW(), NULL, NULL, NULL
            WHERE NOT EXISTS (SELECT 1 FROM source_types WHERE name = 'FILE');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Optional: Remove FILE source type (but be careful - might break existing data)
        // await queryRunner.query(`
        //     DELETE FROM source_types WHERE name = 'FILE';
        // `);
    }
}

