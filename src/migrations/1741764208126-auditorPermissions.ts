import { MigrationInterface, QueryRunner } from "typeorm";

export class AuditorPermissions1741764208126 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO public.permissions (api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at)
            SELECT 'api/v1/audit', 'POST'::public."api_method", '[]'::jsonb, '[6, 7]'::jsonb, false, now(), now()
            WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE api_path = 'api/v1/audit' AND "method" = 'POST');

              INSERT INTO public.permissions (api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at)
            SELECT 'api/v1/audit', 'GET'::public."api_method", '[1,2,3,4,5,6,7]'::jsonb, '[6, 7]'::jsonb, false, now(), now()
            WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE api_path = 'api/v1/audit' AND "method" = 'POST');

            INSERT INTO public.permissions (api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at)
            SELECT '/api/v1/auditor/customers', 'GET'::public."api_method", '[]'::jsonb, '[6, 7]'::jsonb, false, now(), now()
            WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE api_path = '/api/v1/auditor/customers' AND "method" = 'GET');


            INSERT INTO public.permissions (api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at)
            SELECT '/api/v1/onboarding/auditor/customers', 'GET'::public."api_method", '[]'::jsonb, '[6, 7]'::jsonb, false, now(), now()
            WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE api_path = '/api/v1/auditor/customers' AND "method" = 'GET');

            INSERT INTO public.permissions (api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at)
            SELECT '/api/v1/applications/auditors/apps', 'GET'::public."api_method", '[]'::jsonb, '[6, 7]'::jsonb, false, now(), now()
            WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE api_path = '/api/v1/applications/auditors/apps' AND "method" = 'GET');

            INSERT INTO public.permissions (api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at)
            SELECT '/api/v1/onboarding/organization/auditor', 'GET'::public."api_method", '[]'::jsonb, '[1, 2, 3, 4, 5, 6, 7]'::jsonb, false, now(), now()
            WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE api_path = '/api/v1/onboarding/organization/auditor' AND "method" = 'GET');

            INSERT INTO public.permissions (api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at)
            SELECT '/api/v1/impersonations/auditor', 'POST'::public."api_method", '[]'::jsonb, '[1,5,6,7]'::jsonb, false, now(), now()
            WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE api_path = '/api/v1/impersonations/auditor' AND "method" = 'POST');

            INSERT INTO public.permissions (api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at)
            SELECT '/api/v1/impersonations/auditor', 'DELETE'::public."api_method", '[]'::jsonb, '[1,5,6,7]'::jsonb, false, now(), now()
            WHERE NOT EXISTS (SELECT 1 FROM public.permissions WHERE api_path = '/api/v1/impersonations/auditor' AND "method" = 'DELETE' AND allowed_roles = '[1,5,6,7]'::jsonb);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM public.permissions WHERE api_path IN (
                'api/v1/audit',
                '/api/v1/impersonations/auditor',
                '/api/v1/auditor/customers',
                '/api/v1/applications/auditors/apps',
                '/api/v1/onboarding/organization/auditor'
            );
        `);
    }

}
