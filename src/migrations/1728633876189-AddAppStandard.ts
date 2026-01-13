import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAppStandard1728633876189 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "app_standards" (
                "app_id" bigint NOT NULL,
                "standard_id" int NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                PRIMARY KEY ("app_id", "standard_id")
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`DROP TABLE IF EXISTS "app_standards"`);
    }

}
