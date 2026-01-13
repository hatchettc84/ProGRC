import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingOnboardingPermissions1767844745709 implements MigrationInterface {
    name = 'AddMissingOnboardingPermissions1767844745709'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add missing onboarding permissions
        const permissions = [
            // GET /api/v1/onboarding/organization - Get organization info
            {
                apiPath: '/api/v1/onboarding/organization',
                method: 'GET',
                allowedRoles: [3, 4, 2, 7], // org_admin, org_member, super_admin_readonly, auditor
                allowedLicenses: []
            },
            // PUT /api/v1/onboarding/organization - Update organization
            {
                apiPath: '/api/v1/onboarding/organization',
                method: 'PUT',
                allowedRoles: [3], // org_admin
                allowedLicenses: []
            },
            // PATCH /api/v1/onboarding/complete - Mark onboarding complete
            {
                apiPath: '/api/v1/onboarding/complete',
                method: 'PATCH',
                allowedRoles: [3], // org_admin
                allowedLicenses: []
            },
            // PUT /api/v1/onboarding/organization/team_member - Add team members
            {
                apiPath: '/api/v1/onboarding/organization/team_member',
                method: 'PUT',
                allowedRoles: [3], // org_admin
                allowedLicenses: []
            },
            // PUT /api/v1/onboarding/organization/team_member/invite - Resend invite
            {
                apiPath: '/api/v1/onboarding/organization/team_member/invite',
                method: 'PUT',
                allowedRoles: [3], // org_admin
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/list/organization - List organizations
            {
                apiPath: '/api/v1/onboarding/list/organization',
                method: 'GET',
                allowedRoles: [5, 1, 2], // csm, super_admin, super_admin_readonly
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/list/users - List users
            {
                apiPath: '/api/v1/onboarding/list/users',
                method: 'GET',
                allowedRoles: [1, 2, 5], // super_admin, super_admin_readonly, csm
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/organization/{id}/details - Get org details
            {
                apiPath: '/api/v1/onboarding/organization/{id}/details',
                method: 'GET',
                allowedRoles: [2, 3, 4, 5], // super_admin_readonly, org_admin, org_member, csm
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/organization/team_member - Get team members
            {
                apiPath: '/api/v1/onboarding/organization/team_member',
                method: 'GET',
                allowedRoles: [3, 2, 4], // org_admin, super_admin_readonly, org_member
                allowedLicenses: []
            },
            // PUT /api/v1/onboarding/user/profile_info - Update profile
            {
                apiPath: '/api/v1/onboarding/user/profile_info',
                method: 'PUT',
                allowedRoles: [3, 2, 4, 7], // org_admin, super_admin_readonly, org_member, auditor
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/user/profile_info - Get profile
            {
                apiPath: '/api/v1/onboarding/user/profile_info',
                method: 'GET',
                allowedRoles: [5, 3, 2, 4, 7], // csm, org_admin, super_admin_readonly, org_member, auditor
                allowedLicenses: []
            },
            // POST /api/v1/onboarding/user/accept_tos - Accept ToS
            {
                apiPath: '/api/v1/onboarding/user/accept_tos',
                method: 'POST',
                allowedRoles: [4, 7], // org_member, auditor
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/organization/apps/team_members - Get joined team members
            {
                apiPath: '/api/v1/onboarding/organization/apps/team_members',
                method: 'GET',
                allowedRoles: [3, 2, 4], // org_admin, super_admin_readonly, org_member
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/organization/apps - Get organization apps
            {
                apiPath: '/api/v1/onboarding/organization/apps',
                method: 'GET',
                allowedRoles: [3, 2, 4, 7], // org_admin, super_admin_readonly, org_member, auditor
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/organization/app/{id} - Get app details
            {
                apiPath: '/api/v1/onboarding/organization/app/{id}',
                method: 'GET',
                allowedRoles: [3, 4, 7], // org_admin, org_member, auditor
                allowedLicenses: []
            },
            // PUT /api/v1/onboarding/organization/app/{id} - Update app
            {
                apiPath: '/api/v1/onboarding/organization/app/{id}',
                method: 'PUT',
                allowedRoles: [3, 4], // org_admin, org_member
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/organization/templates - Get templates
            {
                apiPath: '/api/v1/onboarding/organization/templates',
                method: 'GET',
                allowedRoles: [3, 2, 4], // org_admin, super_admin_readonly, org_member
                allowedLicenses: []
            },
            // PUT /api/v1/onboarding/organization/templates - Update templates
            {
                apiPath: '/api/v1/onboarding/organization/templates',
                method: 'PUT',
                allowedRoles: [3, 2, 4], // org_admin, super_admin_readonly, org_member
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/frameworks - Get frameworks
            {
                apiPath: '/api/v1/onboarding/frameworks',
                method: 'GET',
                allowedRoles: [3, 2, 4, 1, 5], // org_admin, super_admin_readonly, org_member, super_admin, csm
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/customer/{id}/frameworks - Get customer frameworks
            {
                apiPath: '/api/v1/onboarding/customer/{id}/frameworks',
                method: 'GET',
                allowedRoles: [3, 2, 4, 1, 5], // org_admin, super_admin_readonly, org_member, super_admin, csm
                allowedLicenses: []
            },
            // POST /api/v1/onboarding/customer/frameworks - Add frameworks
            {
                apiPath: '/api/v1/onboarding/customer/frameworks',
                method: 'POST',
                allowedRoles: [3, 2, 4, 1, 5], // org_admin, super_admin_readonly, org_member, super_admin, csm
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/standards - Get standards
            {
                apiPath: '/api/v1/onboarding/standards',
                method: 'GET',
                allowedRoles: [3, 2, 4, 1, 5], // org_admin, super_admin_readonly, org_member, super_admin, csm
                allowedLicenses: []
            },
            // POST /api/v1/onboarding/customer/standards - Add standards
            {
                apiPath: '/api/v1/onboarding/customer/standards',
                method: 'POST',
                allowedRoles: [3, 2, 4, 1, 5], // org_admin, super_admin_readonly, org_member, super_admin, csm
                allowedLicenses: []
            },
            // PATCH /api/v1/onboarding/user/profile_image - Update profile image
            {
                apiPath: '/api/v1/onboarding/user/profile_image',
                method: 'PATCH',
                allowedRoles: [4, 5, 3, 2, 1], // org_member, csm, org_admin, super_admin_readonly, super_admin
                allowedLicenses: []
            },
            // PUT /api/v1/onboarding/{id}/license - Update license
            {
                apiPath: '/api/v1/onboarding/{id}/license',
                method: 'PUT',
                allowedRoles: [5], // csm
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/license - Get license
            {
                apiPath: '/api/v1/onboarding/license',
                method: 'GET',
                allowedRoles: [5, 3, 2, 4], // csm, org_admin, super_admin_readonly, org_member
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/organization/auditor - Get auditors
            {
                apiPath: '/api/v1/onboarding/organization/auditor',
                method: 'GET',
                allowedRoles: [1, 2, 5, 3], // super_admin, super_admin_readonly, csm, org_admin
                allowedLicenses: []
            },
            // PUT /api/v1/onboarding/organization/auditor - Add auditor
            {
                apiPath: '/api/v1/onboarding/organization/auditor',
                method: 'PUT',
                allowedRoles: [1, 5], // super_admin, csm
                allowedLicenses: []
            },
            // GET /api/v1/onboarding/auditor/customers - Get auditor customers
            {
                apiPath: '/api/v1/onboarding/auditor/customers',
                method: 'GET',
                allowedRoles: [7], // auditor
                allowedLicenses: []
            },
            // DELETE /api/v1/onboarding/organization/auditor - Remove auditor
            {
                apiPath: '/api/v1/onboarding/organization/auditor',
                method: 'DELETE',
                allowedRoles: [1, 5], // super_admin, csm
                allowedLicenses: []
            },
        ];

        for (const perm of permissions) {
            await queryRunner.query(`
                INSERT INTO permissions (api_path, method, allowed_roles, allowed_licenses, allow_all)
                VALUES ($1, $2::api_method, $3::jsonb, $4::jsonb, false)
                ON CONFLICT (api_path, method) DO UPDATE 
                SET allowed_roles = EXCLUDED.allowed_roles,
                    allowed_licenses = EXCLUDED.allowed_licenses,
                    allow_all = EXCLUDED.allow_all;
            `, [
                perm.apiPath,
                perm.method,
                JSON.stringify(perm.allowedRoles),
                JSON.stringify(perm.allowedLicenses)
            ]);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the permissions we added
        const apiPaths = [
            '/api/v1/onboarding/organization',
            '/api/v1/onboarding/complete',
            '/api/v1/onboarding/organization/team_member',
            '/api/v1/onboarding/organization/team_member/invite',
            '/api/v1/onboarding/list/organization',
            '/api/v1/onboarding/list/users',
            '/api/v1/onboarding/organization/{id}/details',
            '/api/v1/onboarding/user/profile_info',
            '/api/v1/onboarding/user/accept_tos',
            '/api/v1/onboarding/organization/apps/team_members',
            '/api/v1/onboarding/organization/apps',
            '/api/v1/onboarding/organization/app/{id}',
            '/api/v1/onboarding/organization/templates',
            '/api/v1/onboarding/frameworks',
            '/api/v1/onboarding/customer/{id}/frameworks',
            '/api/v1/onboarding/customer/frameworks',
            '/api/v1/onboarding/standards',
            '/api/v1/onboarding/customer/standards',
            '/api/v1/onboarding/user/profile_image',
            '/api/v1/onboarding/{id}/license',
            '/api/v1/onboarding/license',
            '/api/v1/onboarding/organization/auditor',
            '/api/v1/onboarding/auditor/customers',
        ];

        for (const apiPath of apiPaths) {
            await queryRunner.query(`
                DELETE FROM permissions WHERE api_path = $1;
            `, [apiPath]);
        }
    }
}
