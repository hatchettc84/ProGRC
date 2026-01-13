import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderIndexOnStandardCategory1729849833552 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE standard_control_categories
            ADD COLUMN order_index INT NOT NULL DEFAULT 0;
        `);

        await queryRunner.query(`
            UPDATE standard_control_categories
                SET order_index = CASE name
                    WHEN 'Access Control' THEN 1
                    WHEN 'Awareness And Training' THEN 2
                    WHEN 'Audit And Accountability' THEN 3
                    WHEN 'Assessment, Authorization, And Monitoring' THEN 4
                    WHEN 'Configuration Management' THEN 5
                    WHEN 'Contingency Planning' THEN 6
                    WHEN 'Identification And Authentication' THEN 7
                    WHEN 'Incident Response' THEN 8
                    WHEN 'Maintenance' THEN 9
                    WHEN 'Media Protection' THEN 10
                    WHEN 'Physical And Environmental Protection' THEN 11
                    WHEN 'Planning' THEN 12
                    WHEN 'Program Management' THEN 13
                    WHEN 'Personnel Security' THEN 14
                    WHEN 'Personally Identifiable Information Processing And Transparency' THEN 15
                    WHEN 'Risk Assessment' THEN 16
                    WHEN 'System And Services Acquisition' THEN 17
                    WHEN 'System And Communications Protection' THEN 18
                    WHEN 'System And Information Integrity' THEN 19
                    WHEN 'Supply Chain Risk Management' THEN 20
                    ELSE order_index -- Retains current value if name doesn't match any case
                END;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE standard_control_categories
            DROP COLUMN order_index;
        `);
    }

}
