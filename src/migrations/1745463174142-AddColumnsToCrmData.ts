import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsToCrmData1745463174142 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crm_data" ADD COLUMN "partner_instructions" TEXT`);
        await queryRunner.query(`ALTER TABLE "crm_data" ADD COLUMN "end_customer_instructions" TEXT`);
        await queryRunner.query(`ALTER TABLE "crm_data" ALTER COLUMN "crm_parameters" TYPE TEXT`);

        await queryRunner.query(`ALTER TABLE "app_standards" ADD COLUMN "temp_crm_file_path" varchar(255)`);
        await queryRunner.query(`ALTER TABLE "app_standards" ADD COLUMN "crm_file_uploaded_at" timestamp`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crm_data" DROP COLUMN "partner_instructions"`);
        await queryRunner.query(`ALTER TABLE "crm_data" DROP COLUMN "end_customer_instructions"`);
        await queryRunner.query(`ALTER TABLE "crm_data" ALTER COLUMN "crm_parameters" TYPE VARCHAR(255)`);

        await queryRunner.query(`ALTER TABLE "app_standards" DROP COLUMN "temp_crm_file_path"`);
        await queryRunner.query(`ALTER TABLE "app_standards" DROP COLUMN "crm_file_uploaded_at"`);
    }

}
