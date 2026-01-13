import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompletionAndEvidentOnAppStandardControlEnhancement1729437998096 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            ALTER TABLE app_standard_control_enhancements ADD COLUMN percentage_completion DECIMAL(5,2) DEFAULT 0;
        `)

        queryRunner.query(`
            ALTER TABLE app_standard_control_enhancements ADD COLUMN evidence_document varchar;
            ALTER TABLE app_standard_control_enhancements ADD COLUMN evidence_description TEXT;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            ALTER TABLE app_standard_control_enhancements DROP COLUMN percentage_completion;
        `)

        queryRunner.query(`
            ALTER TABLE app_standard_control_enhancements DROP COLUMN evidence_document;
            ALTER TABLE app_standard_control_enhancements DROP COLUMN evidence_description;
        `)
    }

}
