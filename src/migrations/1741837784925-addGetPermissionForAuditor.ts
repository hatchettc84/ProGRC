import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGetPermissionForAuditor1741837784925 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/onboarding/organization/app/{id}' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/onboarding/list/organization' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/onboarding/organization/{id}/details' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/onboarding/organization/apps' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/assessments' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/applications' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/help-center' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/recommendations' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/app/source_details/{id}' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/app/sources/download' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/app/source/{id}' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/app/source' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/app/evidences/{id}' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/app/tags' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6, 7]' WHERE api_path = '/api/v1/app/metadata' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 5, 6, 7]' WHERE api_path = '/api/v1/onboarding/organization/auditor' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 5, 6, 7]' WHERE api_path = '/api/v1/auditor/customers' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 5, 6, 7]' WHERE api_path = '/api/v1/onboarding/organization/app/{id}' AND "method" = 'GET';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Optionally, you can revert the changes made in the up method
        await queryRunner.query(`
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/onboarding/organization/app/{id}' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/onboarding/list/organization' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/onboarding/organization/{id}/details' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/onboarding/organization/apps' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/assessments' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/applications' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/help-center' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/recommendations' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/app/source_details/{id}' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/app/sources/download' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/app/source/{id}' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/app/source' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/app/evidences/{id}' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/app/tags' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 3, 4, 5, 6]' WHERE api_path = '/api/v1/app/metadata' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 5, 6]' WHERE api_path = '/api/v1/onboarding/organization/auditor' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 5, 6]' WHERE api_path = '/api/v1/auditor/customers' AND "method" = 'GET';
            UPDATE permissions SET allowed_roles = '[1, 2, 5, 6]' WHERE api_path = '/api/v1/onboarding/organization/app/{id}' AND "method" = 'GET';
        `);
    }
}