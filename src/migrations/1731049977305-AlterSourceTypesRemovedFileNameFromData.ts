import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterSourceTypesRemovedFileNameFromData1731049977305 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE source_types 
            SET template_schema = '[
                {
                    "type": "Column",
                    "children": [
                        {
                            "type": "Text",
                            "key": "title",
                            "label": "Title",
                            "placeholder": "Asset Title"
                        },
                        {
                            "type": "Text",
                            "key": "description",
                            "label": "Description",
                            "placeholder": "Description of File"
                        },
                        {
                            "type": "Select",
                            "key": "resourceType",
                            "label": "Resource Type",
                            "options": [
                                "Credentials",
                                "AWS Config",
                                "Documents",
                                "Source Code"
                            ]
                        }
                    ]
                }
            ]'
            WHERE name = 'FILE';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            UPDATE source_types 
            SET template_schema = '[{"type":"Column","children":[{"type":"Text","key":"accountName","label":"Name of File","placeholder":"Example Name"},{"type":"Text","key":"title","label":"Title","placeholder":"Asset Title"},{"type":"Text","key":"description","label":"Description","placeholder":"Description of File"},{"type":"Select","key":"resourceType","label":"Resource Type","options":["Credentials","AWS Config","Documents","Source Code"]}]}]'
            WHERE name = 'FILE';
        `);

    }

}
