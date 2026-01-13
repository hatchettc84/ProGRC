import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterStandardTable1741626677286 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add 'index' column if it doesn't exist
        const table = await queryRunner.getTable('standard');
        if (!table?.findColumnByName('index')) {
            await queryRunner.query(`ALTER TABLE standard ADD COLUMN index int;`);
        }

        // Update data only if it does not exist
        const existingRecords = await queryRunner.query(`SELECT id FROM standard WHERE index IS NOT NULL;`);
        if (existingRecords.length === 0) {
            await queryRunner.query(`
                UPDATE standard SET index = 2 WHERE id = 10;
                UPDATE standard SET index = 1 WHERE id = 11;
                UPDATE standard SET index = 3 WHERE id = 9;
                UPDATE standard SET index = 10 WHERE id = 1;
                UPDATE standard SET index = 9 WHERE id = 3;
                UPDATE standard SET index = 5 WHERE id = 7;
                UPDATE standard SET index = 6 WHERE id = 6;
                UPDATE standard SET index = 4 WHERE id = 8;
                UPDATE standard SET index = 8 WHERE id = 4;
                UPDATE standard SET index = 11 WHERE id = 2;
                UPDATE standard SET index = 7 WHERE id = 5;
            `);
        }

        const frameworkRecords = await queryRunner.query(`SELECT id FROM standard WHERE framework_id = 2;`);
        if (frameworkRecords.length === 0) {
            await queryRunner.query(`
                UPDATE standard SET framework_id = 2 WHERE id IN (5, 7, 6, 8);
            `);
        }

        const nistRecord = await queryRunner.query(`SELECT id FROM standard WHERE id = 12;`);
        if (nistRecord.length === 0) {
            await queryRunner.query(`
                INSERT INTO public.standard (index, id, name, short_description, long_description, path, labels, created_at, updated_at, active, framework_id)
                VALUES (12, 12, 'NIST 800-53', 'NIST 800-53 is a comprehensive set of security and privacy controls...',
                        'NIST 800-53 is a comprehensive set of security and privacy controls...',
                        null, null, now(), now(), true, 2);
            `);
        }

        await queryRunner.query(`
            UPDATE control
            SET framework_id = 2
            WHERE framework_id = 1;
        `);

        // Insert data into standard_control_mapping if not exists
        await queryRunner.query(`
            INSERT INTO standard_control_mapping
                (standard_id, control_id, additional_selection_parameters, additional_guidance, created_at, updated_at)
            SELECT 12, c.id, s.additional_selection_parameters, s.additional_guidance, now(), now()
            FROM standard_control_mapping s
            RIGHT JOIN control c ON s.control_id = c.id
            WHERE s.standard_id = 4 AND c.framework_id = 2;
        `);

        await queryRunner.query(`
            INSERT INTO standard_control_mapping
                (standard_id, control_id, created_at, updated_at)
            SELECT 12, c2.id, now(), now()
            FROM ((SELECT id FROM control c WHERE framework_id = 2)
                  EXCEPT
                  (SELECT s.control_id FROM standard_control_mapping s WHERE standard_id = 12)) c2;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE standard DROP COLUMN IF EXISTS index;`);
        await queryRunner.query(`DELETE FROM standard WHERE id = 12;`);
        await queryRunner.query(`DELETE FROM standard_control_mapping WHERE standard_id = 12;`);
    }
}