import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultToBaseRecommendationGrouping1743684866749 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE poam_table
            ALTER COLUMN base_recommendation_grouping SET DEFAULT '[]'::jsonb,
            ALTER COLUMN control_ids SET DEFAULT '[]'::jsonb,
            ALTER COLUMN standard_ids SET DEFAULT '[]'::jsonb;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE poam_table
            ALTER COLUMN base_recommendation_grouping DROP DEFAULT,
            ALTER COLUMN control_ids DROP DEFAULT,
            ALTER COLUMN standard_ids DROP DEFAULT;
        `);
    }

}
