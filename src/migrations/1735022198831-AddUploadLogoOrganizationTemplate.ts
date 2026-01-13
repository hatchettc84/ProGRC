import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUploadLogoOrganizationTemplate1735022198831 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            ALTER TABLE customer_templates ADD COLUMN logo_path VARCHAR NULL;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            ALTER TABLE customer_templates DROP COLUMN logo_path;
        `)
    }

}
