import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEntityIdAsyncTask1732181504619 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "async_tasks" ADD "entity_type" varchar`);
        await queryRunner.query(`ALTER TABLE "async_tasks" ADD "entity_id" varchar`);

        await queryRunner.query(`
            UPDATE "async_tasks"
            SET "entity_id" = (
                SELECT CAST(id AS VARCHAR)
                FROM source
                WHERE app_id = async_tasks.app_id
                ORDER BY created_at DESC
                LIMIT 1
            ), "entity_type" = 'source'
            WHERE ops = 'CREATE_ASSETS'
        `);

        await queryRunner.query(`
            UPDATE "async_tasks"
            SET "entity_id" = (
                SELECT CAST(id AS VARCHAR)
                FROM compliances
                WHERE app_id = async_tasks.app_id
                ORDER BY created_at DESC
                LIMIT 1
            ),
            "entity_type" = 'compliances'
            WHERE ops = 'UPDATE_COMPLIANCE'
        `);

        await queryRunner.query(`
            UPDATE "async_tasks"
            SET "entity_id" = (
                SELECT CAST(id AS VARCHAR)
                FROM assessment
                WHERE app_id = async_tasks.app_id
                ORDER BY created_at DESC
                LIMIT 1
            ),
            "entity_type" = 'assessment'
            WHERE ops = 'CREATE_ASSESSMENTS'
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "async_tasks" DROP COLUMN "entity_id"`);
        await queryRunner.query(`ALTER TABLE "async_tasks" DROP COLUMN "entity_type"`);
    }

}
