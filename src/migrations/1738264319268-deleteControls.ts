import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteControls1738264319268 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            DELETE FROM public.application_control_mapping
            WHERE control_id IN (503, 1095, 678);
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
