import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionsForCRM1745843941707 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allow_all)
            VALUES ('/api/v1/crm', 'GET'::"api_method", true);
        `);
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allowed_licenses, allowed_roles)
            VALUES ('/api/v1/crm', 'POST'::"api_method", '[1,2,3,4,5,6]'::jsonb, '[1,3,4,5]'::jsonb);
        `);
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allowed_licenses, allowed_roles)
            VALUES ('/api/v1/crm', 'PUT'::"api_method", '[1,2,3,4,5,6]'::jsonb, '[1,3,4,5]'::jsonb);
        `);
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allowed_licenses, allowed_roles)
            VALUES ('/api/v1/crm', 'DELETE'::"api_method", '[1,2,3,4,5,6]'::jsonb, '[1,3,4,5]'::jsonb);
        `);
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allowed_licenses, allowed_roles)
            VALUES ('/api/v1/crm', 'PATCH'::"api_method", '[1,2,3,4,5,6]'::jsonb, '[1,3,4,5]'::jsonb);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/crm' 
            AND "method" = 'GET'::"api_method";
        `);
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/crm' 
            AND "method" = 'POST'::"api_method";
        `);
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/crm' 
            AND "method" = 'PUT'::"api_method";
        `);
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/crm' 
            AND "method" = 'DELETE'::"api_method";
        `);
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/crm' 
            AND "method" = 'PATCH'::"api_method";
        `);
        
    }

}
