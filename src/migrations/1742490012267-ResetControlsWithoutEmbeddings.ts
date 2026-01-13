import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetControlsWithoutEmbeddings1742490012267 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            DROP VIEW IF EXISTS control_view;
        `);
        await queryRunner.query(`
            ALTER TABLE public."control" 
            ALTER COLUMN source_control_mapping_emb TYPE vector(768)
        `);

        await queryRunner.query(`
            CREATE VIEW control_view
            (id, framework_id, control_parent_id, control_name, family_name, control_long_name,
             control_text, control_discussion, control_summary, source_control_mapping_emb,
             control_eval_criteria, created_at, updated_at, active, source_control_mapping,
             order_index, grouping_control_id, is_enhancement, control_short_summary)
            AS
            SELECT c1.id,
                   c1.framework_id,
                   c1.control_parent_id,
                   c1.control_name,
                   c1.family_name,
                   c1.control_long_name,
                   c1.control_text,
                   c1.control_discussion,
                   c1.control_summary,
                   c1.source_control_mapping_emb,
                   c1.control_eval_criteria,
                   c1.created_at,
                   c1.updated_at,
                   c1.active,
                   c1.source_control_mapping,
                   c1.order_index,
                   CASE
                       WHEN c1.control_parent_id IS NULL THEN c1.id
                       ELSE c1.control_parent_id
                   END AS grouping_control_id,
                   CASE
                       WHEN c1.control_parent_id IS NULL THEN 0
                       ELSE 1
                   END AS is_enhancement,
                   c1.control_short_summary
            FROM control c1;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public."control" 
            ALTER COLUMN source_control_mapping_emb TYPE vector(128)
        `);

        await queryRunner.query(`
            DROP VIEW IF EXISTS control_view;
        `);
    }

}
