import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTemplatePermissions1751455118355 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert permission for template list if not exists
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allow_all)
            SELECT '/api/v1/template/list', 'GET'::"api_method", true
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/template/list' AND "method" = 'GET'::"api_method"
            );
        `);

        // Insert permission for template details if not exists
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allow_all)
            SELECT '/api/v1/template/{id}/details', 'GET'::"api_method", true
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/template/{id}/details' AND "method" = 'GET'::"api_method"
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the inserted permissions
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/template/list' AND "method" = 'GET'::"api_method";
        `);

        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/template/{id}/details' AND "method" = 'GET'::"api_method";
        `);
    }

}
