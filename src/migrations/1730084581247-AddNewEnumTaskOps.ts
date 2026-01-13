import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewEnumTaskOps1730084581247 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const result = await queryRunner.query(`
            SELECT t.typname as enum_name
            FROM pg_type t
            JOIN pg_enum e ON t.oid = e.enumtypid
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE t.typname IN (
                SELECT udt_name
                FROM information_schema.columns
                WHERE table_name = 'async_tasks' AND column_name = 'ops'
            )
            LIMIT 1;
        `);

        const enumTypeName = result[0].enum_name;

        await queryRunner.query(`
            ALTER TYPE "${enumTypeName}" ADD VALUE IF NOT EXISTS 'UPDATE_COMPLIANCE';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
