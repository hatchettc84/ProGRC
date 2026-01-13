import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTemporaryPasswordColumn1710000000000 implements MigrationInterface {
    name = 'AddTemporaryPasswordColumn1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
     //   await queryRunner.query(`ALTER TABLE "users" ADD "is_using_temporary_password" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
     //await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_using_temporary_password"`);
    }
} 