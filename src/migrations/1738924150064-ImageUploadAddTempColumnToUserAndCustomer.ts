import { MigrationInterface, QueryRunner } from "typeorm";

export class ImageUploadAddTempColumnToUserAndCustomer1738924150064 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE customers ADD COLUMN IF NOT EXISTS temp_logo_image_key VARCHAR(255) DEFAULT NULL;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_profile_image_key VARCHAR(255) DEFAULT NULL;

            UPDATE customers SET is_logo_available = false;
            UPDATE users SET is_profile_image_available = false;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE customers DROP COLUMN IF EXISTS temp_logo_image_key;
            ALTER TABLE users DROP COLUMN IF EXISTS temp_profile_image_key;
        `);
    }

}
