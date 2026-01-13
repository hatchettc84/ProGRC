import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFeaturePermissions1747111786416 implements MigrationInterface {
    name = 'UpdateFeaturePermissions1747111786416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update permissions for my-features endpoint
        await queryRunner.query(`
            UPDATE public.permissions
            SET allowed_roles='[1, 2, 3, 4, 5, 6, 7]'::jsonb
            WHERE api_path = '/api/v1/features/my-features' and "method"='GET'
        `);

        // Update permissions for customer flags GET endpoint
        await queryRunner.query(`
            UPDATE public.permissions
            SET allowed_roles='[1, 5]'::jsonb
            WHERE api_path = '/api/v1/features/customer/{id}/flags' and "method"='GET'
        `);

        // Update permissions for customer flags PUT endpoint
        await queryRunner.query(`
            UPDATE public.permissions
            SET allowed_roles='[1, 5]'::jsonb
            WHERE api_path = '/api/v1/features/customer/{id}/flags' and "method"='PUT'
        `);

        // Insert JWT auth permissions
        await queryRunner.query(`
            INSERT INTO public.permissions
            (api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at)
            VALUES
            ('/api/v1/jwt-auth', 'GET'::public."api_method", '[]'::jsonb, '[]'::jsonb, true, now(), now()),
            ('/api/v1/jwt-auth', 'PUT'::public."api_method", '[]'::jsonb, '[]'::jsonb, true, now(), now()),
            ('/api/v1/jwt-auth', 'POST'::public."api_method", '[]'::jsonb, '[]'::jsonb, true, now(), now())
            ON CONFLICT (api_path, method) DO NOTHING
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert JWT auth permissions
        await queryRunner.query(`
            DELETE FROM public.permissions
            WHERE api_path = '/api/v1/jwt-auth'
        `);

        // Revert customer flags permissions
        await queryRunner.query(`
            UPDATE public.permissions
            SET allowed_roles='[]'::jsonb
            WHERE api_path = '/api/v1/features/customer/{id}/flags' and "method" IN ('GET', 'PUT')
        `);

        // Revert my-features permissions
        await queryRunner.query(`
            UPDATE public.permissions
            SET allowed_roles='[]'::jsonb
            WHERE api_path = '/api/v1/features/my-features' and "method"='GET'
        `);
    }
} 