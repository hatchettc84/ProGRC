import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLicenseRulesData1741254135402 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
INSERT INTO license_rules (license_type_id,"name")
	VALUES (1,'Beta rule');
INSERT INTO license_rules (license_type_id,"name")
	VALUES (2,'Design Partner Rule');
INSERT INTO license_rules (license_type_id,"name")
	VALUES (3,'Starter rule');
INSERT INTO license_rules (license_type_id,"name")
	VALUES (4,'Team rule');
INSERT INTO license_rules (license_type_id,"name")
	VALUES (5,'Enterprise rule');
INSERT INTO license_rules (license_type_id,"name",number_of_applications,number_of_assessments,standards_per_application)
	VALUES (6,'Trial rule',1,1,1);
INSERT INTO license_rules (license_type_id,"name",number_of_applications,number_of_assessments,standards_per_application)
	VALUES (7,'Expired rule',1,1,1);
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            DELETE * FROM license_rules;
            `
        );
    }

}
