import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionForPromptVariables1751400000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allowed_roles)
            SELECT '/api/v1/prompt-variables', 'GET'::"api_method", '[1,2,3,4,5]'::jsonb
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/prompt-variables' 
                AND method = 'GET'::"api_method"
            );

            INSERT INTO permissions (api_path, "method", allowed_roles)
            SELECT '/api/v1/prompt-variables', 'POST'::"api_method", '[1,5]'::jsonb
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/prompt-variables' 
                AND method = 'POST'::"api_method"
            );

            INSERT INTO permissions (api_path, "method", allowed_roles)
            SELECT '/api/v1/prompt-variables', 'PUT'::"api_method", '[1,5]'::jsonb
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/prompt-variables' 
                AND method = 'PUT'::"api_method"
            );

            INSERT INTO permissions (api_path, "method", allowed_roles)
            SELECT '/api/v1/prompt-variables', 'DELETE'::"api_method", '[1,5]'::jsonb
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/prompt-variables' 
                AND method = 'DELETE'::"api_method"
            );

            INSERT INTO permissions (api_path, "method", allowed_roles)
            SELECT '/api/v1/prompt-variables', 'PATCH'::"api_method", '[1,5]'::jsonb
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/prompt-variables' 
                AND method = 'PATCH'::"api_method"
            );

        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/prompt-variables' 
            AND method = 'GET'::"api_method";
        `);

        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/prompt-variables' 
            AND method = 'POST'::"api_method";
        `);
        
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/prompt-variables' 
            AND method = 'PUT'::"api_method";
        `);
        
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/prompt-variables' 
            AND method = 'DELETE'::"api_method";
        `);
        
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/prompt-variables' 
            AND method = 'PATCH'::"api_method";
        `);

    }

}