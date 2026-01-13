import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultToControlAndStandardIds1743684284715 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE poam_table
            ALTER COLUMN control_ids SET DEFAULT '{}'::jsonb,
            ALTER COLUMN standard_ids SET DEFAULT '{}'::jsonb;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE poam_table
            ALTER COLUMN control_ids DROP DEFAULT,
            ALTER COLUMN standard_ids DROP DEFAULT;
        `);
    }

}
