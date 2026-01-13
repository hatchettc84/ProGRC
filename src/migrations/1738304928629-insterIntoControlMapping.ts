import { MigrationInterface, QueryRunner } from "typeorm";

export class InsterIntoControlMapping1738304928629 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            INSERT INTO standard_control_mapping (standard_id, control_id, created_at, updated_at)
            SELECT 9, id, now(), now()
            FROM control
            WHERE control_name IN ('AC-3-1-1','AC-3-1-2','AC-3-1-20','AC-3-1-22','IA-3-5-1','IA-3-5-2','MP-3-8-3','PE-3-10-1','PE-3-10-3','PE-3-10-4','PE-3-10-5','SC-3-13-1','SC-3-13-5','SI-3-14-1','SI-3-14-2','SI-3-14-4','SI-3-14-5')
            AND NOT EXISTS (
                SELECT 1
                FROM standard_control_mapping
                WHERE standard_id = 9
                AND control_id = control.id
            );

            UPDATE standard
            SET active = true
            WHERE id = 9;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM standard_control_mapping
            WHERE standard_id = 9
            AND control_id IN (
                SELECT id
                FROM control
                WHERE control_name IN ('AC-3-1-1','AC-3-1-2','AC-3-1-20','AC-3-1-22','IA-3-5-1','IA-3-5-2','MP-3-8-3','PE-3-10-1','PE-3-10-3','PE-3-10-4','PE-3-10-5','SC-3-13-1','SC-3-13-5','SI-3-14-1','SI-3-14-2','SI-3-14-4','SI-3-14-5')
            );

            UPDATE standard
            SET active = false
            WHERE id = 9;
        `);
    }

}
