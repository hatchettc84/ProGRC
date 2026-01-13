import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTosAcceptedAtInUsers1736504141846 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMP WITHOUT TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE public.users DROP COLUMN IF EXISTS tos_accepted_at`);
    }

}
