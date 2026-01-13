import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePolicyDetailsTemplateForeignKey1751532873550 implements MigrationInterface {
    name = 'UpdatePolicyDetailsTemplateForeignKey1751532873550'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, handle existing data by setting template_id to NULL for records that reference non-existent templates
        await queryRunner.query(`
            UPDATE policy_details 
            SET template_id = NULL 
            WHERE template_id IS NOT NULL 
            AND template_id NOT IN (SELECT id FROM templates)
        `);
        
        // Drop the old foreign key constraint that references policy_template
        await queryRunner.query(`ALTER TABLE "policy_details" DROP CONSTRAINT IF EXISTS "FK_policy_details_template"`);
        
        // Add new foreign key constraint that references templates table
        await queryRunner.query(`ALTER TABLE "policy_details" ADD CONSTRAINT "FK_policy_details_templates" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        
        // Create index for better performance if it doesn't exist
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_policy_details_template_id" ON "policy_details" ("template_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the new foreign key constraint
        await queryRunner.query(`ALTER TABLE "policy_details" DROP CONSTRAINT IF EXISTS "FK_policy_details_templates"`);
        
        // Recreate the old foreign key constraint that references policy_template
        await queryRunner.query(`ALTER TABLE "policy_details" ADD CONSTRAINT "FK_policy_details_template" FOREIGN KEY ("template_id") REFERENCES "policy_template"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }
}
