import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermission1742390871309 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE permissions p SET allowed_roles = '[6, 7]' WHERE p.api_path ILIKE '/api/v1/audit/feedback' AND p."method" = 'POST';
            UPDATE permissions p SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE p.api_path ILIKE '/api/v1/onboarding/organization/auditor' AND p."method" = 'GET';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE permissions p SET allowed_roles = '[1, 3, 5, 6, 7]' WHERE p.api_path ILIKE '/api/v1/audit/feedback' AND p."method" = 'POST';
            UPDATE permissions p SET allowed_roles = '[1, 2, 5, 6, 7]' WHERE p.api_path ILIKE '/api/v1/onboarding/organization/auditor' AND p."method" = 'GET';
        `);
    }

}