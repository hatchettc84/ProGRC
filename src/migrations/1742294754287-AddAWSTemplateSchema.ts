import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSourceTypesAddAWSTemplateSchema1742294754287
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            UPDATE source_types 
            SET template_schema = '[
                {
                    "type": "Column",
                    "children": [
                        {
                            "type": "Text",
                            "key": "role_arn",
                            "label": "Role ARN",
                            "placeholder": "arn:aws:iam::123456789012:role/MyRole"
                        }
                    ]
                }
            ]'::jsonb
            WHERE name = 'AWS';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE source_types 
        SET template_schema = NULL
        WHERE name = 'AWS';
    `);
  }
}
