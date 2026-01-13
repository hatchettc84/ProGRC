import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStandardCategoryForNist1729760706709 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            TRUNCATE TABLE standard_control_categories;
        `);
        queryRunner.query(`
            WITH standard AS (
                SELECT id FROM standards WHERE key = 'nist_800_53'
            )
            INSERT INTO standard_control_categories (standard_id, name)
            VALUES 
            ((SELECT id FROM standard), 'Access Control'),
            ((SELECT id FROM standard), 'Awareness And Training'),
            ((SELECT id FROM standard), 'Audit And Accountability'),
            ((SELECT id FROM standard), 'Assessment, Authorization, And Monitoring'),
            ((SELECT id FROM standard), 'Configuration Management'),
            ((SELECT id FROM standard), 'Contingency Planning'),
            ((SELECT id FROM standard), 'Identification And Authentication'),
            ((SELECT id FROM standard), 'Incident Response'),
            ((SELECT id FROM standard), 'Maintenance'),
            ((SELECT id FROM standard), 'Media Protection'),
            ((SELECT id FROM standard), 'Physical And Environmental Protection'),
            ((SELECT id FROM standard), 'Planning'),
            ((SELECT id FROM standard), 'Program Management'),
            ((SELECT id FROM standard), 'Personnel Security'),
            ((SELECT id FROM standard), 'Personally Identifiable Information Processing And Transparency'),
            ((SELECT id FROM standard), 'Risk Assessment'),
            ((SELECT id FROM standard), 'System And Services Acquisition'),
            ((SELECT id FROM standard), 'System And Communications Protection'),
            ((SELECT id FROM standard), 'System And Information Integrity'),
            ((SELECT id FROM standard), 'Supply Chain Risk Management');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            TRUNCATE TABLE standard_control_categories;
            WITH standard AS (
                SELECT id FROM standards WHERE key = 'nist_800_53'
            )
            INSERT INTO standard_control_categories (standard_id, name)
            VALUES 
            ((SELECT id FROM standard), 'Access Control');
        `);
    }

}
