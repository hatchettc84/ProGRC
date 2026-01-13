import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAppUsers1728000628864 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "app_users" (
            "app_id" bigint NOT NULL,
            "user_id" uuid NOT NULL,
            "role" varchar NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            PRIMARY KEY ("app_id", "user_id")
        )`);

        await queryRunner.query(`
            INSERT INTO "app_users" ("app_id", "user_id", "role")
            SELECT "id", "owner_id", 'owner'
            FROM "app" WHERE "owner_id" IS NOT NULL
        `);

        await queryRunner.query(`ALTER TABLE "app" DROP COLUMN "owner_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app" ADD COLUMN "owner_id" uuid`);

        await queryRunner.query(`
            UPDATE "app"
            SET "owner_id" = (
                SELECT "user_id"
                FROM "app_users"
                WHERE "app_users"."app_id" = "app"."id"
                AND "app_users"."role" = 'owner'
                LIMIT 1
            )
        `);

        await queryRunner.query(`DROP TABLE IF EXISTS "app_users"`);
    }

}
