import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterSourceTypeTemplateschema1735544610325 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE source_types
            SET template_schema = '[{"type":"Column","children":[{"type":"Text","key":"description","label":"Description","placeholder":"Description of File"},{"type":"Select","key":"resourceType","label":"Resource Type","options":["Documents","System Config File"]}]}]'
            WHERE name = 'FILE';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE source_types
            SET template_schema = NULL -- or the previous value if known
            WHERE name = 'FILE';
        `);
    }

}
