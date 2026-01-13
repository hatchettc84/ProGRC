import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableTosHistory1736504433657 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.tos_history
            (
                id SERIAL PRIMARY KEY,
                user_id UUID NOT NULL,
                customer_id VARCHAR NOT NULL,
                accepted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
                ip_address VARCHAR NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
                updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            DROP TABLE IF EXISTS public.tos_history;
        `);
    }

}
