import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSourceIdToAssets1729223639827 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "assets"
            ADD COLUMN "source_id" uuid NOT NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "assets"
            DROP COLUMN "source_id";
        `);
    }

}
