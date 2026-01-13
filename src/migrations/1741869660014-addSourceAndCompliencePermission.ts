import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourceAndCompliencePermission1741869660014 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE permissions SET allowed_licenses = '[1, 2, 3, 4, 5, 6]' WHERE permissions.api_path ILIKE '/api/v1/app/source' AND permissions."method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE permissions.api_path ILIKE '/api/v1/compliances' AND permissions."method" = 'GET';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE permissions SET allowed_licenses = '[1, 2, 3, 4, 5]' WHERE permissions.api_path ILIKE '/api/v1/app/source' AND permissions."method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE permissions.api_path ILIKE '/api/v1/compliances' AND permissions."method" = 'GET';
        `);
    }
}