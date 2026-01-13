import { MigrationInterface, QueryRunner } from "typeorm";

export class DropAppAssetsAndAssetsSourceType1731322755686 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('app_assets', true);
        await queryRunner.dropTable('app_assets', true);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "app_assets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "asset_name" varchar NULL,
                "source_type_id" int NULL,
                "app_id" bigint NULL,
                "detailed_info" json NOT NULL,
                "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" timestamp NULL,
                "created_by_user_id" uuid NULL,
                "updated_by_user_id" uuid NULL,
                "deleted_at" timestamp NULL,
                PRIMARY KEY ("id")
            )
        `);

        // Recreate the foreign keys
        await queryRunner.query(`
            ALTER TABLE "app_assets" 
            ADD CONSTRAINT "FK_source_type_id" FOREIGN KEY ("source_type_id") REFERENCES "app_source_types"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "app_assets" 
            ADD CONSTRAINT "FK_app_id" FOREIGN KEY ("app_id") REFERENCES "app"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "app_assets" 
            ADD CONSTRAINT "FK_created_by_user_id" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "app_assets" 
            ADD CONSTRAINT "FK_updated_by_user_id" FOREIGN KEY ("updated_by_user_id") REFERENCES "user"("id") ON DELETE SET NULL
        `);

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"app_source_types" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_6356e84fa1e0db89fdc45f4d70f" PRIMARY KEY ("id"))`);

    }

}
