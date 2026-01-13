import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImplementationOnStandardControl1729662940332 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standard_controls" ADD "implementation" TEXT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "standard_controls" DROP COLUMN "implementation"`);
    }
}
