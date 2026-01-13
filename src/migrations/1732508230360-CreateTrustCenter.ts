import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTrustCenter1732508230360 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE trust_centers (
            id SERIAL PRIMARY KEY,
            app_id bigint NOT NULL,
            assessment_id int NOT NULL,
            customer_id varchar(255) NOT NULL,
            name text not null,
            file_path text,
            approval_date date,
            submission_date date,
            status varchar(255) not null,
            assessment_version int DEFAULT 0,
            created_at timestamp DEFAULT now(),
            created_by uuid NOT NULL,
            updated_at timestamp DEFAULT now(),
            updated_by uuid NOT NULL,
            external_id uuid default uuid_generate_v4(),
            deleted boolean DEFAULT false,
            UNIQUE (app_id, customer_id, assessment_id)
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE trust_centers`);
    }

}
