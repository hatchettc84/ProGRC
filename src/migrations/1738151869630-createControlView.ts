import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateControlView1738151869630 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE VIEW control_view AS
            SELECT *,
                   CASE
                       WHEN c1.control_parent_id IS NULL THEN c1.id
                       ELSE c1.control_parent_id
                   END AS grouping_control_id,
                   CASE
                       WHEN c1.control_parent_id IS NULL THEN 0
                       ELSE 1
                   END AS is_enhancement
            FROM control c1;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP VIEW IF EXISTS control_view;
        `);
    }

}
