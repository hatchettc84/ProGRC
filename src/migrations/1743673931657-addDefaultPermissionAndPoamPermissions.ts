import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultPermissionAndPoamPermissions1743673931657 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        // Insert permissions for GET request if not exists
        await queryRunner.query(`
            INSERT INTO public.permissions
            (api_path, "method", allow_all)
            SELECT '/api/v1/poams', 'GET'::public."api_method", true
            WHERE NOT EXISTS (
                SELECT 1 FROM public.permissions 
                WHERE api_path = '/api/v1/poams' AND "method" = 'GET'::public."api_method"
            );
        `);

        // Insert permissions for POST request if not exists
        await queryRunner.query(`
            INSERT INTO public.permissions
            (api_path, "method", allowed_licenses, allowed_roles, allow_all)
            SELECT '/api/v1/poams', 'POST'::public."api_method", '[1,2,3,4,5,6]'::jsonb, '[1, 3, 4, 5]'::jsonb, false
            WHERE NOT EXISTS (
                SELECT 1 FROM public.permissions 
                WHERE api_path = '/api/v1/poams' AND "method" = 'POST'::public."api_method"
            );
        `);
        await queryRunner.query(`
            INSERT INTO public.permissions
            (api_path, "method", allowed_licenses, allowed_roles, allow_all)
            SELECT '/api/v1/poams', 'PATCH'::public."api_method", '[1,2,3,4,5,6]'::jsonb, '[1, 3, 4, 5]'::jsonb, false
            WHERE NOT EXISTS (
                SELECT 1 FROM public.permissions 
                WHERE api_path = '/api/v1/poams' AND "method" = 'PATCH'::public."api_method"
            );
        `);
        await queryRunner.query(`
            INSERT INTO public.permissions
            (api_path, "method", allowed_licenses, allowed_roles, allow_all)
            SELECT '/api/v1/poams', 'PUT'::public."api_method", '[1,2,3,4,5,6]'::jsonb, '[1, 3, 4, 5]'::jsonb, false
            WHERE NOT EXISTS (
                SELECT 1 FROM public.permissions 
                WHERE api_path = '/api/v1/poams' AND "method" = 'PUT'::public."api_method"
            );
        `);
        await queryRunner.query(`
            INSERT INTO public.permissions
            (api_path, "method", allowed_licenses, allowed_roles, allow_all)
            SELECT '/api/v1/poams', 'DELETE'::public."api_method", '[1,2,3,4,5,6]'::jsonb, '[1, 3, 4, 5]'::jsonb, false
            WHERE NOT EXISTS (
                SELECT 1 FROM public.permissions 
                WHERE api_path = '/api/v1/poams' AND "method" = 'DELETE'::public."api_method"
            );
        `);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM public.permissions 
            WHERE api_path = '/api/v1/poams' AND "method" IN ('GET', 'POST', 'PATCH', 'PUT', 'DELETE')
        `);
    }

}
