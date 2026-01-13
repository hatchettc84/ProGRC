import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionForUserCommentApi1741812264881 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            INSERT INTO permissions (api_path,"method",allow_all)
	            VALUES ('/api/v1/user-comment','GET'::"api_method",true);    
            INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	            VALUES ('/api/v1/user-comment','POST'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,3,5,6,7]'::jsonb);    
            INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	            VALUES ('/api/v1/user-comment','PATCH'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,3,5,6,7]'::jsonb);    
            INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	            VALUES ('/api/v1/user-comment','DELETE'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,3,5,6,7]'::jsonb);    
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DELETE FROM permissions WHERE api_path='/api/v1/user-comment';
            `
        );
    }

}
