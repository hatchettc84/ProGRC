import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTenetIdandIsActiveInAsset1729558821030 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "assets"
            ADD "customer_id" varchar(255) NOT NULL,
            ADD "is_active" boolean NOT NULL DEFAULT true
          `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "assets"
            DROP COLUMN "customer_id",
            DROP COLUMN "is_active"
          `);
    }

}
