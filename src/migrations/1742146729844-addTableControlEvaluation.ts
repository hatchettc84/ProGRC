import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTableControlEvaluation1742146729844 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.control_evaluation_results (
                id serial4 NOT NULL,
                implementation_id int4 NOT NULL,
                app_id int4 NOT NULL,
                standard_id int4 NOT NULL,
                control_id int4 NOT NULL,
                requirement text NOT NULL,
                created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
                explanation text NULL,
                customer_id varchar NOT NULL,
                status varchar NOT NULL CHECK (status IN ('Partial', 'Pass', 'Fail')),
                CONSTRAINT control_evaluation_results_app_id_standard_id_control_id_re_key UNIQUE (app_id, standard_id, control_id, requirement, customer_id),
                CONSTRAINT control_evaluation_results_pkey PRIMARY KEY (id)
            );

        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trigger_update_timestamp ON public.control_evaluation_results;
            DROP FUNCTION IF EXISTS update_timestamp;
            DROP TABLE IF EXISTS public.control_evaluation_results;
        `);
    }
}