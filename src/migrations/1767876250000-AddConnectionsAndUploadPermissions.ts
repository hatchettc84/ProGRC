import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConnectionsAndUploadPermissions1767876250000 implements MigrationInterface {
    name = 'AddConnectionsAndUploadPermissions1767876250000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add permission for POST /api/v1/connections
        await queryRunner.query(`
            INSERT INTO permissions (api_path, method, allowed_roles, allowed_licenses, allow_all, created_at, updated_at)
            VALUES (
                '/api/v1/connections',
                'POST'::api_method,
                '[3,4]'::jsonb,
                '[]'::jsonb,
                false,
                NOW(),
                NOW()
            )
            ON CONFLICT (api_path, method) DO UPDATE
            SET allowed_roles = '[3,4]'::jsonb,
                updated_at = NOW();
        `);

        // Add permission for GET /api/v1/connections
        await queryRunner.query(`
            INSERT INTO permissions (api_path, method, allowed_roles, allowed_licenses, allow_all, created_at, updated_at)
            VALUES (
                '/api/v1/connections',
                'GET'::api_method,
                '[3,4,7]'::jsonb,
                '[]'::jsonb,
                false,
                NOW(),
                NOW()
            )
            ON CONFLICT (api_path, method) DO UPDATE
            SET allowed_roles = '[3,4,7]'::jsonb,
                updated_at = NOW();
        `);

        // Add permission for PATCH /api/v1/connections/{id}
        await queryRunner.query(`
            INSERT INTO permissions (api_path, method, allowed_roles, allowed_licenses, allow_all, created_at, updated_at)
            VALUES (
                '/api/v1/connections/{id}',
                'PATCH'::api_method,
                '[3,4]'::jsonb,
                '[]'::jsonb,
                false,
                NOW(),
                NOW()
            )
            ON CONFLICT (api_path, method) DO UPDATE
            SET allowed_roles = '[3,4]'::jsonb,
                updated_at = NOW();
        `);

        // Add permission for DELETE /api/v1/connections/{id}
        await queryRunner.query(`
            INSERT INTO permissions (api_path, method, allowed_roles, allowed_licenses, allow_all, created_at, updated_at)
            VALUES (
                '/api/v1/connections/{id}',
                'DELETE'::api_method,
                '[3,4]'::jsonb,
                '[]'::jsonb,
                false,
                NOW(),
                NOW()
            )
            ON CONFLICT (api_path, method) DO UPDATE
            SET allowed_roles = '[3,4]'::jsonb,
                updated_at = NOW();
        `);

        // Add permission for POST /api/v1/app/uploads/generate-presigned-url
        await queryRunner.query(`
            INSERT INTO permissions (api_path, method, allowed_roles, allowed_licenses, allow_all, created_at, updated_at)
            VALUES (
                '/api/v1/app/uploads/generate-presigned-url',
                'POST'::api_method,
                '[3,4,5]'::jsonb,
                '[]'::jsonb,
                false,
                NOW(),
                NOW()
            )
            ON CONFLICT (api_path, method) DO UPDATE
            SET allowed_roles = '[3,4,5]'::jsonb,
                updated_at = NOW();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/connections' AND method = 'POST'::api_method;
        `);

        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/connections' AND method = 'GET'::api_method;
        `);

        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/connections/{id}' AND method = 'PATCH'::api_method;
        `);

        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/connections/{id}' AND method = 'DELETE'::api_method;
        `);

        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/app/uploads/generate-presigned-url' AND method = 'POST'::api_method;
        `);
    }
}
