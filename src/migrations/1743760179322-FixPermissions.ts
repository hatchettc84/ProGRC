import { MigrationInterface, QueryRunner } from "typeorm";

export class FixPermissions1743760179322 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
UPDATE permissions
	SET allowed_roles='[1, 2, 3, 4, 5, 6]'::jsonb
	WHERE api_path='/api/v1/app/sources/upload' and method='POST';
UPDATE permissions
	SET allowed_licenses='[1, 2, 3, 4, 5, 6]'::jsonb,allowed_roles='[1, 3, 4, 5, 6]'::jsonb
	WHERE api_path='/api/v1/app/source_v2' and method='POST';
UPDATE permissions
	SET allowed_licenses='[1, 2, 3, 4, 5, 6]'::jsonb,allowed_roles='[1, 3, 4, 5]'::jsonb
	WHERE api_path='/api/v1/app/source/{id}' and method='DELETE';
UPDATE permissions
	SET allowed_licenses='[1, 2, 3, 4, 5, 6]'::jsonb,allowed_roles='[1, 3, 4, 5]'::jsonb
	WHERE api_path='/api/v1/app/source/{id}' and method='PUT';
UPDATE permissions
	SET allowed_licenses='[1, 2, 3, 4, 5, 6]'::jsonb,allowed_roles='[1, 3, 4, 5, 6]'::jsonb
	WHERE api_path='/api/v1/app/{id}/sources' and method='PATCH';
UPDATE permissions
	SET allowed_licenses='[1, 2, 3, 4, 5, 6]'::jsonb,allowed_roles='[1, 3, 4, 5, 6]'::jsonb
	WHERE api_path='/api/v1/app/{id}/download/source/{id}' and method='PATCH';
UPDATE permissions
	SET allowed_licenses='[1, 2, 3, 4, 5, 6]'::jsonb,allowed_roles='[1, 2, 3, 4, 5, 6, 7]'::jsonb
	WHERE api_path='/api/v1/app/generate_response' and method='POST';
UPDATE permissions
	SET allowed_licenses='[1, 2, 3, 4, 5, 6]'::jsonb,allowed_roles='[1, 3, 4, 5]'::jsonb
	WHERE api_path='/api/v1/app/upload_files' and method='POST';
UPDATE permissions
	SET allowed_licenses='[1, 2, 3, 4, 5, 6]'::jsonb,allowed_roles='[1, 3, 4, 5]'::jsonb
	WHERE api_path='/api/v1/app/uploads/generate-presigned-url' and method='POST';

    INSERT INTO permissions (api_path, method, allow_all) VALUES
    ('/api/v1/app/{id}/download/source-text/{id}', 'GET', true);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            select 1;
        `);
    }

}
