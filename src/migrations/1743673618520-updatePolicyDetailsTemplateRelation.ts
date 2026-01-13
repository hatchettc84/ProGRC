import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePolicyDetailsTemplateRelation1743673618520 implements MigrationInterface {
    name = 'UpdatePolicyDetailsTemplateRelation1743673618520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing template_ids column if it exists
        await queryRunner.query(`ALTER TABLE "policy_details" DROP COLUMN IF EXISTS "template_ids"`);
        
        // Add template_id column as a foreign key
        await queryRunner.query(`ALTER TABLE "policy_details" ADD COLUMN "template_id" integer`);
        
        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "policy_details" ADD CONSTRAINT "FK_policy_details_template" FOREIGN KEY ("template_id") REFERENCES "policy_template"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        
        // Create index for better performance
        await queryRunner.query(`CREATE INDEX "IDX_policy_details_template_id" ON "policy_details" ("template_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index
        await queryRunner.query(`DROP INDEX "IDX_policy_details_template_id"`);
        
        // Drop the foreign key constraint
        await queryRunner.query(`ALTER TABLE "policy_details" DROP CONSTRAINT "FK_policy_details_template"`);
        
        // Drop the template_id column
        await queryRunner.query(`ALTER TABLE "policy_details" DROP COLUMN "template_id"`);
    }
} 