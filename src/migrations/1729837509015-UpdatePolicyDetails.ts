import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePolicyDetails1729837509015 implements MigrationInterface {
    name = 'UpdatePolicyDetails1729837509015'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, create a temporary column for appIds
        await queryRunner.query(`select 1`);
      //  await queryRunner.query(`ALTER TABLE "policy_details" ADD "app_ids" integer[]`);
        
        // Create a temporary column for references3urls
        // await queryRunner.query(`ALTER TABLE "policy_details" ADD "references3urls" text[]`);
        
        // // Migrate existing references3url data to the new array format
        // await queryRunner.query(`
        //     UPDATE "policy_details"
        //     SET "references3urls" = CASE 
        //         WHEN "references3url" IS NOT NULL AND "references3url" != '' 
        //         THEN ARRAY["references3url"]
        //         ELSE '{}'
        //     END
        // `);
        
        // // Drop the old references3url column
        // await queryRunner.query(`ALTER TABLE "policy_details" DROP COLUMN "references3url"`);
        
        // // Rename the temporary columns to their final names
        // await queryRunner.query(`ALTER TABLE "policy_details" RENAME COLUMN "app_ids" TO "appIds"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Create a temporary column for the old references3url
        await queryRunner.query(`select 1`);
        //await queryRunner.query(`ALTER TABLE "policy_details" ADD "references3url" character varying`);
        
        // Migrate data back to the old format (taking the first URL if multiple exist)
        // await queryRunner.query(`
        //     UPDATE "policy_details"
        //     SET "references3url" = CASE 
        //         WHEN "references3urls" IS NOT NULL AND array_length("references3urls", 1) > 0 
        //         THEN "references3urls"[1]
        //         ELSE NULL
        //     END
        // `);
        
        // Drop the new columns
        // await queryRunner.query(`ALTER TABLE "policy_details" DROP COLUMN "references3urls"`);
        // await queryRunner.query(`ALTER TABLE "policy_details" DROP COLUMN "appIds"`);
    }
} 