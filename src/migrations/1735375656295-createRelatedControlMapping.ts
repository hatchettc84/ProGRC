import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRelatedControlMapping1735375656295 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.related_controls_mapping (
                id SERIAL PRIMARY KEY,
                a_control_id INT4 NULL,
                b_control_id INT4 NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.related_controls_mapping;
        `);
    }

}
