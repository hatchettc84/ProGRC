import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShortNameStandardCategory1732178831112 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standard_categories" ADD COLUMN "short_name" varchar(255)`);

        await queryRunner.query(`
            UPDATE "standard_categories"
            SET short_name = CASE name
                WHEN 'Access Control' THEN 'AC'
                WHEN 'Awareness And Training' THEN 'AT'
                WHEN 'Audit And Accountability' THEN 'AU'
                WHEN 'Assessment, Authorization, And Monitoring' THEN 'CA'
                WHEN 'Configuration Management' THEN 'CM'
                WHEN 'Contingency Planning' THEN 'CP'
                WHEN 'Identification And Authentication' THEN 'IA'
                WHEN 'Incident Response' THEN 'IR'
                WHEN 'Maintenance' THEN 'MA'
                WHEN 'Media Protection' THEN 'MP'
                WHEN 'Physical And Environmental Protection' THEN 'PE'
                WHEN 'Planning' THEN 'PL'
                WHEN 'Program Management' THEN 'PM'
                WHEN 'Personnel Security' THEN 'PS'
                WHEN 'Personally Identifiable Information Processing And Transparency' THEN 'PT'
                WHEN 'Risk Assessment' THEN 'RA'
                WHEN 'System And Services Acquisition' THEN 'SA'
                WHEN 'System And Communications Protection' THEN 'SC'
                WHEN 'System And Information Integrity' THEN 'SI'
                WHEN 'Supply Chain Risk Management' THEN 'SR'
                ELSE short_name -- retain the current value if no match
            END
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standard_categories" DROP COLUMN "short_name"`);
    }

}
