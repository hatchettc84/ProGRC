import { MigrationInterface, QueryRunner } from "typeorm";

export class UploadProcessUpdatedTables1738742067713 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_logo_available BOOLEAN DEFAULT false;
          ALTER TABLE customers ADD COLUMN IF NOT EXISTS logo_updated_at TIMESTAMP DEFAULT NULL;
          
          ALTER TABLE users ADD COLUMN IF NOT EXISTS is_profile_image_available BOOLEAN DEFAULT false;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS image_updated_at TIMESTAMP DEFAULT NULL;
          
          ALTER TABLE application_control_evidence ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;
          ALTER TABLE application_control_evidence ADD COLUMN IF NOT EXISTS uuid VARCHAR(255);
          
          ALTER TABLE source ADD COLUMN IF NOT EXISTS file_bucket_key VARCHAR(255) DEFAULT NULL;
          ALTER TABLE source ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT false;
          ALTER TABLE source ADD COLUMN IF NOT EXISTS uuid VARCHAR(255);

          UPDATE "source" AS s
          SET file_bucket_key = sv.file_bucket_key
          FROM "source_version" sv
          WHERE s.current_version = sv.id;
          
          UPDATE source SET is_available = true where file_bucket_key is not null;

          UPDATE application_control_evidence SET is_available = true;

          UPDATE customers SET is_logo_available = true;

          UPDATE users SET is_profile_image_available = true;
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          ALTER TABLE customers DROP COLUMN IF EXISTS is_logo_available;
          ALTER TABLE customers DROP COLUMN IF EXISTS logo_updated_at;
          
          ALTER TABLE users DROP COLUMN IF EXISTS is_profile_image_available;
          ALTER TABLE users DROP COLUMN IF EXISTS image_updated_at;
          
          ALTER TABLE application_control_evidence DROP COLUMN IF EXISTS is_available;
          ALTER TABLE application_control_evidence DROP COLUMN IF EXISTS uuid;
          
          ALTER TABLE source DROP COLUMN IF EXISTS file_bucket_key;
          ALTER TABLE source DROP COLUMN IF EXISTS is_available;
          ALTER TABLE source DROP COLUMN IF EXISTS uuid;
        `);
      }

}
