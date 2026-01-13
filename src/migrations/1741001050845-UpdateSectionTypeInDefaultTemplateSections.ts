import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSectionTypeInDefaultTemplateSections1741001050845 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(
            `
            UPDATE templates_section SET type = 'CONTROL_FAMILY', is_looped=true, parent_id=(SELECT id from templates_section where section_id='816e5573-2d17-4a74-b298-9bbcdb8a277c') WHERE section_id = '482071c1-39a8-4810-b594-cdbb9ebbab3b';
            UPDATE templates_section SET type = 'CONTROL', is_looped=true, parent_id=(SELECT id from templates_section where section_id='482071c1-39a8-4810-b594-cdbb9ebbab3b') WHERE section_id = 'b7583545-fb39-4b9e-a0f7-10f70a9cefaf';
            `
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `
            UPDATE templates_section SET type = 'CONTROL_FAMILY', is_looped=true, parent_id=(SELECT id from templates_section where section_id='816e5573-2d17-4a74-b298-9bbcdb8a277c') WHERE section_id = '482071c1-39a8-4810-b594-cdbb9ebbab3b';
            UPDATE templates_section SET type = 'CONTROL', is_looped=true, parent_id=(SELECT id from templates_section where section_id='482071c1-39a8-4810-b594-cdbb9ebbab3b') WHERE section_id = 'b7583545-fb39-4b9e-a0f7-10f70a9cefaf';
            `
        );
    }

}
