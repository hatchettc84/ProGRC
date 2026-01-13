import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGetAllSourcePermission1742194617939 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            INSERT INTO permissions (api_path,"method",allow_all)
                VALUES ('/api/v1/app/{id}/sources','GET'::"api_method",true);
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DELETE FROM permissions WHERE api_path = '/api/v1/app/{id}/sources' AND "method" = 'GET';
            `
        );
    }

}
