import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateLicenseRuleForTrialLicense1741609236856 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`UPDATE license_rules SET available_standards = '[1,5,9,10]', available_templates = '[4]' WHERE license_type_id = 6`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE license_rules SET available_standards = '[1,5,9,10]', available_templates = '[4]' WHERE license_type_id = 6`);
    }

}
