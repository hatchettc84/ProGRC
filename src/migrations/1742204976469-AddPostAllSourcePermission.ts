import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostAllSourcePermission1742204976469 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            INSERT INTO permissions (api_path,"method",allowed_licenses, allowed_roles)
                VALUES ('/api/v1/app/{id}/sources','POST'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,3,4,5]'::jsonb);
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DELETE FROM permissions WHERE api_path = '/api/v1/app/{id}/sources' AND "method" = 'POST';
            `
        );
    }

}
