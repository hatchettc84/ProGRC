import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePermission1743055956748 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Alter async_tasks table to make app_id nullable
        await queryRunner.query(`
            ALTER TABLE async_tasks 
            ALTER COLUMN app_id DROP NOT NULL;
        `);

        // Insert permissions for GET request if not exists
        await queryRunner.query(`
            INSERT INTO public.permissions
            (api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at)
            SELECT '/api/v1/policies', 'GET'::public."api_method", '[]'::jsonb, '[1, 2, 3, 4, 5, 6, 7]'::jsonb, false, '2025-03-12 23:43:32.687', '2025-03-12 23:43:32.687'
            WHERE NOT EXISTS (
                SELECT 1 FROM public.permissions 
                WHERE api_path = '/api/v1/policies' AND "method" = 'GET'::public."api_method"
            );
        `);

        // Insert permissions for POST request if not exists
        await queryRunner.query(`
            INSERT INTO public.permissions
            (api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at)
            SELECT '/api/v1/policies', 'POST'::public."api_method", '[]'::jsonb, '[1, 2, 3, 4, 5]'::jsonb, false, '2025-03-12 23:43:32.687', '2025-03-12 23:43:32.687'
            WHERE NOT EXISTS (
                SELECT 1 FROM public.permissions 
                WHERE api_path = '/api/v1/policies' AND "method" = 'POST'::public."api_method"
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert the async_tasks table alteration
        await queryRunner.query(`
            ALTER TABLE async_tasks 
            ALTER COLUMN app_id SET NOT NULL;
        `);

        // Delete the inserted permissions
        await queryRunner.query(`
            DELETE FROM public.permissions
            WHERE api_path = '/api/v1/policies' AND "method" = 'GET'::public."api_method";
        `);

        await queryRunner.query(`
            DELETE FROM public.permissions
            WHERE api_path = '/api/v1/policies' AND "method" = 'POST'::public."api_method";
        `);
    }
}
