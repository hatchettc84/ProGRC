import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAskAiPermissions1743760179323 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the permissions already exist before inserting
        await queryRunner.query(`
            DO $$
            BEGIN
                -- Check if the GET permission for ask-ai exists
                IF NOT EXISTS (
                    SELECT 1 FROM permissions 
                    WHERE api_path = '/api/v1/ask-ai' AND method = 'GET'::api_method
                ) THEN
                    INSERT INTO permissions (api_path, method, allow_all)
                    VALUES ('/api/v1/ask-ai', 'GET'::api_method, true);
                END IF;

                -- Check if the POST permission for ask-ai exists
                IF NOT EXISTS (
                    SELECT 1 FROM permissions 
                    WHERE api_path = '/api/v1/ask-ai' AND method = 'POST'::api_method
                ) THEN
                    INSERT INTO permissions (api_path, method, allow_all)
                    VALUES ('/api/v1/ask-ai', 'POST'::api_method, true);
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the permissions in the down migration
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/ask-ai' 
            AND (method = 'GET'::api_method OR method = 'POST'::api_method);
        `);
    }
} 