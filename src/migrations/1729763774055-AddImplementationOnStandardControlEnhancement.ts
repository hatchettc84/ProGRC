import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImplementationOnStandardControlEnhancement1729763774055 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            ALTER TABLE standard_control_enhancements
            ADD COLUMN implementation TEXT;
        `);

        queryRunner.query(`
            ALTER TABLE standard_controls
            ADD COLUMN order_index INT;
        `)

        queryRunner.query(`
                ALTER TABLE standard_control_enhancements
                ADD COLUMN order_index INT;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            ALTER TABLE standard_control_enhancements
            DROP COLUMN implementation;
        `);

        queryRunner.query(`
            ALTER TABLE standard_controls
            DROP COLUMN order_index;
        `)

        queryRunner.query(`
                ALTER TABLE standard_control_enhancements
                DROP COLUMN order_index;
        `)
    }

}
