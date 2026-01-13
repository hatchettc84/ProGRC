import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableCustomerCsms1731572406656 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE customer_csms (
                customer_id varchar(255) NOT NULL,
                user_id uuid NOT NULL,
                created_at timestamp DEFAULT now(),
                created_by uuid NOT NULL,
                UNIQUE (customer_id, user_id)
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE customer_csms;`);
    }

}
