import { MigrationInterface, QueryRunner } from "typeorm";
import { ApiMethodType } from "../entities/permission.entity";

export class AddFeaturesPermissions1742146729845 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM public.permissions
                WHERE api_path = '/api/v1/features/customer/{id}/flags'
                AND "method" = 'GET'
              ) THEN
                INSERT INTO public.permissions (
                  api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at
                )
                VALUES (
                  '/api/v1/features/customer/{id}/flags',
                  'GET'::public."api_method",
                  '[]'::jsonb,
                  '[5]'::jsonb,
                  true,
                  now(),
                  now()
                );
              END IF;
            END
            $$;
      
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM public.permissions
                WHERE api_path = '/api/v1/features/my-features'
                AND "method" = 'GET'
              ) THEN
                INSERT INTO public.permissions (
                  api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at
                )
                VALUES (
                  '/api/v1/features/my-features',
                  'GET'::public."api_method",
                  '[]'::jsonb,
                  '[3, 5]'::jsonb,
                  true,
                  now(),
                  now()
                );
              END IF;
            END
            $$;
      
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM public.permissions
                WHERE api_path = '/api/v1/features/customer/{id}/flags'
                AND "method" = 'PUT'
              ) THEN
                INSERT INTO public.permissions (
                  api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at
                )
                VALUES (
                  '/api/v1/features/customer/{id}/flags',
                  'PUT'::public."api_method",
                  '[]'::jsonb,
                  '[5]'::jsonb,
                  true,
                  now(),
                  now()
                );
              END IF;
            END
            $$;
      
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM public.permissions
                WHERE api_path = '/api/v1/features/{id}'
                AND "method" = 'DELETE'
              ) THEN
                INSERT INTO public.permissions (
                  api_path, "method", allowed_licenses, allowed_roles, allow_all, created_at, updated_at
                )
                VALUES (
                  '/api/v1/features/{id}',
                  'DELETE'::public."api_method",
                  '[]'::jsonb,
                  '[5]'::jsonb,
                  true,
                  now(),
                  now()
                );
              END IF;
            END
            $$;
          `);
        }
      
        public async down(queryRunner: QueryRunner): Promise<void> {
          // Optional: implement rollback logic if needed
        }
} 