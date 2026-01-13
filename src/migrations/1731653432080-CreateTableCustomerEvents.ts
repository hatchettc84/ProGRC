import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableCustomerEvents1731653432080 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        CREATE TABLE customer_events (
            id bigserial PRIMARY KEY,
            type varchar NOT NULL,
            customer_id varchar(255) NOT NULL,
            notes text,
            date timestamp,
            done boolean default false,
            created_at timestamp default now(),
            created_by uuid,
            updated_at timestamp default now(),
            updated_by uuid
        );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE customer_events`);
    }

}
