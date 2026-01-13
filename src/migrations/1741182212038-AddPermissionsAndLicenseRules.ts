import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionsAndLicenseRules1741182212038 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            `
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/notifications','GET'::"api_method",'[1,2,3,4,5,6]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/async_task','GET'::"api_method",'[1,2,3,4,5,6]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/async_task','POST'::"api_method",'[1,2,3,4,5]'::jsonb,'[1,2,3,4,5,6]'::jsonb);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/api/docs','GET'::"api_method",true);
INSERT INTO permissions (api_path,"method",allowed_licenses)
	VALUES ('/api/v1/api/docs','POST'::"api_method",'[1,2,3,4,5,6]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses)
	VALUES ('/api/v1/api/docs','DELETE'::"api_method",'[1,2,3,4,5,6]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/api/onboarding/organization','GET'::"api_method",'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/organization/team_member','GET'::"api_method",'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/list/organization','GET'::"api_method",'[1,2,5,6]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/list/users','GET'::"api_method",'[1,2,3,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/organization/{id}/details','GET'::"api_method",'[1,2]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/user/profile_info','GET'::"api_method",'[1,2,3,4,5,6,7]'::jsonb);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/onboarding/organization/apps/team_members','GET'::"api_method",true);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/onboarding/organization/apps','GET'::"api_method",true);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/onboarding/organization/app/{id}','GET'::"api_method",true);
INSERT INTO permissions (api_path,"method",allowed_roles,allow_all)
	VALUES ('/api/v1/onboarding/organization/templates','GET'::"api_method",'[1,2,3,4,5]'::jsonb,false);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/frameworks','GET'::"api_method",'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/standards','GET'::"api_method",'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/license','GET'::"api_method",'[1,2,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/organization','PUT'::"api_method",'[1,2,3,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/complete','PATCH'::"api_method",'[1,2,3,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/onboarding/organization/team_member','PUT'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/onboarding/organization/team_member/invite','PUT'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/user/profile_info','PUT'::"api_method",'[1,2,3,4,5,6,7]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/user/accept_tos','PUT'::"api_method",'[1,2,3,4,5,6,7]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/onboarding/organization/app/{id}','PUT'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/onboarding/organization/templates','PUT'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/onboarding/{id}/license','PUT'::"api_method",'[1,2,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/assessments','GET'::"api_method",true);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/assessments','PUT'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/assessments','POST'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/assessments','DELETE'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/applications','GET'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/applications','PUT'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/applications','PATCH'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/applications','POST'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/applications','DELETE'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/compliances','GET'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/compliances','PUT'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/compliances','POST'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/compliances','DELETE'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,2,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}/customer-managers','POST'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}/customer-managers','DELETE'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}','PUT'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}','DELETE'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}/notes','PATCH'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}/members/{id}/reset-password','POST'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}/members/{id}','PUT'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}/members/{id}','DELETE'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/members/{id}','PUT'::"api_method",'[1,3,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/members/{id}','DELETE'::"api_method",'[1,3,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/update-logo','PATCH'::"api_method",'[1,3,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}/events','GET'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}/events','POST'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}/events/{id}','POST'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/customers/{id}/events/{id}','DELETE'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/impersonations','POST'::"api_method",'[1,5,6]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/impersonations','DELETE'::"api_method",'[1,5,6]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/internal-users','GET'::"api_method",'[1,2,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/internal-users','POST'::"api_method",'[1]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/internal-users/{id}','DELETE'::"api_method",'[1]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/internal-users/{id}/reset-password','POST'::"api_method",'[1,5,6]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/helpdesk/contact','POST'::"api_method",'[1,3,4,5,6]'::jsonb);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/trust-centers','GET'::"api_method",true);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/trust-centers/{id}','PATCH'::"api_method",'[1,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/trust-centers/{id}','DELETE'::"api_method",'[1,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/csm/help-center','GET'::"api_method",'[1,2,5,6]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/csm/help-center','PUT'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/csm/help-center','POST'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/csm/help-center','DELETE'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/help-center','GET'::"api_method",true);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/help-center','POST'::"api_method",'[1,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/template','GET'::"api_method",'[1,2,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/template','PATCH'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/template','POST'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/template','DELETE'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/recommendations','POST'::"api_method",true);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/recommendations','GET'::"api_method",true);
INSERT INTO permissions (api_path,"method",allowed_licenses,allowed_roles)
	VALUES ('/api/v1/recommendations/{id}','PATCH'::"api_method",'[1,2,3,4,5,6]'::jsonb,'[1,3,4,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/feature-flags','GET'::"api_method",true);
    INSERT INTO permissions (api_path,"method",allowed_roles,allow_all)
        VALUES ('/api/v1/feature-flags','POST'::"api_method",'[1]'::jsonb,true);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/feature-flags','PATCH'::"api_method",'[1]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/feature-flags','DELETE'::"api_method",'[1]'::jsonb);
INSERT INTO permissions (api_path,"method",allowed_roles)
	VALUES ('/api/v1/auth/org_admin','POST'::"api_method",'[1,5]'::jsonb);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/auth','POST'::"api_method",true);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/auth','PUT'::"api_method",true);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/quickStart','POST'::"api_method",true);
INSERT INTO permissions (api_path,"method",allow_all)
	VALUES ('/api/v1/quickStart','GET'::"api_method",true);

    `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            `
            DELETE * FROM permissions;
            `
        );
    }

}
