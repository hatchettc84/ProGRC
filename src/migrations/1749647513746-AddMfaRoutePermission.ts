import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMfaRoutePermission1749647513746 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allow_all)
            SELECT '/api/v1/auth/mfa', 'GET'::"api_method", true
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/auth/mfa' 
                AND method = 'GET'::"api_method"
            );

            INSERT INTO permissions (api_path, "method", allow_all)
            SELECT '/api/v1/auth/mfa', 'POST'::"api_method", true
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/auth/mfa' 
                AND method = 'POST'::"api_method"
            );

            INSERT INTO permissions (api_path, "method", allow_all)
            SELECT '/api/v1/auth/mfa', 'PUT'::"api_method", true
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/auth/mfa' 
                AND method = 'PUT'::"api_method"
            );

            INSERT INTO permissions (api_path, "method", allow_all)
            SELECT '/api/v1/auth/mfa', 'DELETE'::"api_method", true
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/auth/mfa' 
                AND method = 'DELETE'::"api_method"
            );

            INSERT INTO permissions (api_path, "method", allow_all)
            SELECT '/api/v1/auth/mfa', 'PATCH'::"api_method", true
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/auth/mfa' 
                AND method = 'PATCH'::"api_method"
            );

            INSERT INTO permissions (api_path, "method", allow_all)
            SELECT '/api/v1/jwt-auth/mfa', 'POST'::"api_method", true
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/jwt-auth/mfa' 
                AND method = 'POST'::"api_method"
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/auth/mfa' 
            AND method = 'GET'::"api_method";
        `);

        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/auth/mfa' 
            AND method = 'POST'::"api_method";
        `);
        
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/auth/mfa' 
            AND method = 'PUT'::"api_method";
        `);
        
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/auth/mfa' 
            AND method = 'DELETE'::"api_method";
        `);
        
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/auth/mfa' 
            AND method = 'PATCH'::"api_method";
        `);

        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/jwt-auth/mfa' 
            AND method = 'POST'::"api_method";
        `);
    }

}
