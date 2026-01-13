import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUploadPresignedUrlPermission1767880184554 implements MigrationInterface {
    name = 'FixUploadPresignedUrlPermission1767880184554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Ensure permission exists for POST /api/v1/app/uploads/generate-presigned-url
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
        // Rollback: Remove the permission
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/app/uploads/generate-presigned-url' AND method = 'POST'::api_method;
        `);
    }
}
