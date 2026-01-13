import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAllGetPermissions1744112291998 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE permissions SET allowed_licenses = '[]' WHERE method = 'GET';`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE permissions SET allowed_licenses = '[]' WHERE method = 'GET';`);
    }

}
