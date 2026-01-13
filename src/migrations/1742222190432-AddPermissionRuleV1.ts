import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionRuleV11742222190432 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        
        await queryRunner.query(
            `
            INSERT INTO permissions (api_path,"method",allowed_roles)
                VALUES ('/api/v1/template','PUT'::"api_method",'[1,5]'::jsonb);
            INSERT INTO permissions (api_path,"method",allow_all)
                VALUES ('/api/v1/app/{id}/download/source/{id}','GET'::"api_method",true);
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DELETE FROM permissions WHERE api_path = '/api/v1/template' AND "method" = 'PUT';
            DELETE FROM permissions WHERE api_path = '/api/v1/app/{id}/download/source/{id}' AND "method" = 'GET';
            `
        );
    }

}
