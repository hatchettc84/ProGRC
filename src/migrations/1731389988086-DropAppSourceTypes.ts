import { MigrationInterface, QueryRunner } from "typeorm";

export class DropAppSourceTypes1731389988086 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('app_source_types', true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS"app_source_types" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_6356e84fa1e0db89fdc45f4d70f" PRIMARY KEY ("id"))`);

    }

}
