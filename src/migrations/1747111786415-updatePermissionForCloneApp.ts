import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePermissionForCloneApp1747111786415 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allowed_roles)
            SELECT '/api/v1/applications/{id}/clone', 'POST'::"api_method", '[1,2,3,4,5,6]'::jsonb
            WHERE NOT EXISTS (
                SELECT 1 FROM permissions 
                WHERE api_path = '/api/v1/applications/{id}/clone' 
                AND method = 'POST'::"api_method"
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/applications/{id}/clone' 
            AND method = 'POST'::"api_method";
        `);
    }

}
