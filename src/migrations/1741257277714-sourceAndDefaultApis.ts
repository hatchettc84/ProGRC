import { MigrationInterface, QueryRunner } from "typeorm";

export class SourceAndDefaultApis1741257277714 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const permissions = [
            { apiPath: '/api/v1/app/sources/upload', method: 'POST', allowedRoles: '[1,2,3,4,5,6]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/source_details/{id}', method: 'GET', allowedRoles: '[1,2,3,4,5,6]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/sources/download', method: 'GET', allowedRoles: '[1,2,3,4,5,6]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/source_v2', method: 'POST', allowedRoles: '[1,3,4,5,6]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/source/{id}', method: 'GET', allowedRoles: '[1,2,3,4,5,6,7]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/source', method: 'GET', allowedRoles: '[1,2,3,4,5,6,7]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/source/{id}', method: 'DELETE', allowedRoles: '[1,3,4,5]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/source/{id}', method: 'PUT', allowedRoles: '[1,3,4,5]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/evidences/{id}', method: 'GET', allowedRoles: '[1,2,3,4,5,6,7]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/tags', method: 'GET', allowedRoles: '[1,2,3,4,5,6]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/{id}/sources', method: 'PATCH', allowedRoles: '[1,3,4,5,6]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/{id}/download/source/{id}', method: 'PATCH', allowedRoles: '[1,3,4,5,6]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/metadata', method: 'GET', allowedRoles: '[1,2,3,4,5,6,7]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/generate_response', method: 'POST', allowedRoles: '[1,2,3,4,5,6,7]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/upload_files', method: 'POST', allowedRoles: '[1,3,4,5]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/app/uploads/generate-presigned-url', method: 'POST', allowedRoles: '[1,3,4,5]', allowedLicenses: '[]' },
            { apiPath: '/api/v1/health', method: 'GET', allowAll: true },
            { apiPath: '/api/v1/ask-ai/query', method: 'POST', allowedRoles: '[1,2,3,4,5,6,7]', allowedLicenses: '[]' }
        ];

        for (const permission of permissions) {
            // Check if permission already exists
            const exists = await queryRunner.query(
                `SELECT 1 FROM permissions WHERE api_path = $1 AND method = $2 LIMIT 1;`,
                [permission.apiPath, permission.method]
            );

            if (exists.length === 0) {
                await queryRunner.query(
                    `INSERT INTO permissions (api_path, "method", allowed_licenses, allowed_roles, allow_all)
                     VALUES ($1, $2, $3, $4, $5);`,
                    [
                        permission.apiPath,
                        permission.method,
                        permission.allowedLicenses || '[]',
                        permission.allowedRoles || '[]',
                        permission.allowAll || false
                    ]
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback by deleting the inserted records
        await queryRunner.query(`
            DELETE FROM permissions WHERE api_path IN (
                '/api/v1/app/sources/upload',
                '/api/v1/app/source_details/{id}',
                '/api/v1/app/sources/download',
                '/api/v1/app/source_v2',
                '/api/v1/app/source/{id}',
                '/api/v1/app/source',
                '/api/v1/app/source/{id}',
                '/api/v1/app/source/{id}',
                '/api/v1/app/evidences/{id}',
                '/api/v1/app/tags',
                '/api/v1/app/{id}/sources',
                '/api/v1/app/{id}/download/source/{id}',
                '/api/v1/app/metadata',
                '/api/v1/app/generate_response',
                '/api/v1/app/upload_files',
                '/api/v1/app/uploads/generate-presigned-url',
                '/api/v1/health',
                '/api/v1/ask-ai/query'
            );
        `);
        }
}
