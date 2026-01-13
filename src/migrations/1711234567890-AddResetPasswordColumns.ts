import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResetPasswordColumns1711234567890 implements MigrationInterface {
    name = 'AddResetPasswordColumns1711234567890'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
        // await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_code" character varying`);
        // await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "reset_password_expires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
        // await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_expires"`);
        // await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "reset_password_code"`);
    }
} 