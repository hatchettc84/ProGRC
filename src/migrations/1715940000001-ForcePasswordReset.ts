import { MigrationInterface, QueryRunner } from "typeorm";

export class ForcePasswordReset1715940000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
       // await queryRunner.query(`UPDATE "users" SET "password_reset_required" = true`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
      //  await queryRunner.query(`UPDATE "users" SET "password_reset_required" = false`);
    }
} 