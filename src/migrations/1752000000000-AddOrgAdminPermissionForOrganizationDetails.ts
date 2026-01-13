import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrgAdminPermissionForOrganizationDetails1752000000000 implements MigrationInterface {
    name = 'AddOrgAdminPermissionForOrganizationDetails1752000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update the permission to allow org_admin (3), org_member (4), and csm (5) roles
        await queryRunner.query(`
            UPDATE permissions 
            SET allowed_roles = '[1,2,3,4,5]'::jsonb
            WHERE api_path = '/api/v1/onboarding/organization/{id}/details' 
            AND method = 'GET'::api_method;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to original permission (only super_admin and super_admin_readonly)
        await queryRunner.query(`
            UPDATE permissions 
            SET allowed_roles = '[1,2]'::jsonb
            WHERE api_path = '/api/v1/onboarding/organization/{id}/details' 
            AND method = 'GET'::api_method;
        `);
    }
}



