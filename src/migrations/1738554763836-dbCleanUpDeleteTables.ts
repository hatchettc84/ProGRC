import { MigrationInterface, QueryRunner } from "typeorm";

export class DbCleanUpDeleteTables1738554763836 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            DROP TABLE IF EXISTS 
              source,
              compliances,
              standards,
              compliance_assets,
              compliance_categories,
              compliance_controls,
              compliance_control_enhancements,
              compliance_control_enhancement_evidences,
              standard_categories,
              standard_controls,
              standard_control_enhancements;
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
