import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditFeedbackPermission1741859304640 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allowed_licenses, allowed_roles)
            VALUES ('/api/v1/audit/feedback', 'POST'::"api_method", '[1,2,3,4,5,6]'::jsonb, '[1,3,5,6,7]'::jsonb);

            INSERT INTO permissions (api_path, "method", allowed_licenses, allowed_roles)
            VALUES ('/api/v1/audit/feedback', 'GET'::"api_method", '[1,2,3,4,5,6]'::jsonb, '[1,2,3,4,5,6,7]'::jsonb);
            
            INSERT INTO permissions (api_path, "method", allowed_licenses, allowed_roles)
            VALUES ('/api/v1/audit/feedback', 'PATCH'::"api_method", '[1,2,3,4,5,6]'::jsonb, '[1,3,4,5,6,7]'::jsonb);

            INSERT INTO permissions (api_path, "method", allowed_licenses, allowed_roles)
            VALUES ('/api/v1/audit/feedback', 'DELETE'::"api_method", '[1,2,3,4,5,6]'::jsonb, '[1,3,4,5,6,7]'::jsonb);

            INSERT INTO permissions (api_path, "method", allowed_licenses, allowed_roles)
            VALUES ('/api/v1/audit/bulkFeedback', 'PATCH'::"api_method", '[1,2,3,4,5,6]'::jsonb, '[1,3,4,5,6,7]'::jsonb);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM permissions WHERE api_path = '/api/v1/audit/feedback' AND "method" = 'POST';
            DELETE FROM permissions WHERE api_path = '/api/v1/audit/feedback' AND "method" = 'GET';
            DELETE FROM permissions WHERE api_path = '/api/v1/audit/feedback' AND "method" = 'PATCH';
            DELETE FROM permissions WHERE api_path = '/api/v1/audit/feedback' AND "method" = 'DELETE';
            DELETE FROM permissions WHERE api_path = '/api/v1/audit/bulkFeedback' AND "method" = 'PATCH';
        `);
    }
}