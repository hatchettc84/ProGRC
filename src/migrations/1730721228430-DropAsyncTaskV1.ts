import { MigrationInterface, QueryRunner } from "typeorm";

export class DropAsyncTaskV11730721228430 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS "async_tasks_v1";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`
            CREATE TABLE "async_tasks_v1" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "entity_type" VARCHAR NOT NULL CHECK ("entity_type" IN ('ASSESSMENT', 'SOURCE')),
                "entity_id" UUID NOT NULL,
                "app_id" BIGINT,
                "tenant_id" INT NOT NULL,
                "is_notified" BOOLEAN NOT NULL,
                "task_status" VARCHAR NOT NULL CHECK ("task_status" IN ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'REQUEST_INITIATED', 'RESPONSE_RECEIVED')),
                "request_payload" JSON NOT NULL,
                "response_payload" JSON,
                "metadata" JSON,
                "created_by" UUID NOT NULL,
                "updated_by" UUID,
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "deleted_at" TIMESTAMP
            );
        `);
    }

}
