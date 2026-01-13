import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterPromptTemplateVariableMakeCustomerIdNullable1751400000002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE IF EXISTS prompt_template_variables
            ALTER COLUMN customer_id DROP NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE IF EXISTS prompt_template_variables
            ALTER COLUMN customer_id SET NOT NULL;
        `);
    }

}
