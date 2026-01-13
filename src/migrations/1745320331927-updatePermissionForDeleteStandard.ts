import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePermissionForDeleteStandard1745320331927 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO permissions (api_path, "method", allowed_roles)
            VALUES ('/api/v1/applications/{id}/standards/{id}', 'DELETE'::"api_method", '[1,2,3,4,5]'::jsonb);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM permissions 
            WHERE api_path = '/api/v1/applications/{id}/standards/{id}' 
            AND "method" = 'DELETE'::"api_method";
        `);
    }

}
