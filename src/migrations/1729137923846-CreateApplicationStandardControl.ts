import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApplicationStandardControl1729137923846 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS app_standard_controls (
                id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
                app_id bigint NOT NULL,
                standard_control_id uuid NOT NULL,
                standard_id int NOT NULL,
                risk_levels VARCHAR(255),
                created_at TIMESTAMP DEFAULT now()
            );

            CREATE TABLE IF NOT EXISTS app_standard_control_enhancements (
                id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
                app_standard_control_id uuid NOT NULL,
                implementation TEXT,
                standard_control_enhancement_id uuid NOT NULL,
                status varchar default 'not_implemented',
                exception boolean default false,
                exception_reason TEXT,
                risk_levels VARCHAR(255),
                created_at TIMESTAMP DEFAULT now(),
                updated_at TIMESTAMP DEFAULT now()
            );
        `);

        await queryRunner.query(`
            CREATE INDEX app_standard_controls_app_id_index ON app_standard_controls (app_id, standard_id);
            CREATE INDEX app_standard_controls_standard_control_id_index ON app_standard_controls (standard_control_id);
            CREATE INDEX app_standard_control_enhancements_app_standard_control_id_index ON app_standard_control_enhancements (app_standard_control_id);
            CREATE INDEX app_standard_control_enhancements_standard_control_enhancement_id_index ON app_standard_control_enhancements (standard_control_enhancement_id);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS app_standard_controls;
            DROP TABLE IF EXISTS app_standard_control_enhancements;
            DROP TYPE app_standard_control_enhancement_status;
        `);
    }

}
