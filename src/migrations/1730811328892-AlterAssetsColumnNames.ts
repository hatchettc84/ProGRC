import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AlterAssetsColumnNames1730811328892 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the existing `assets` table if it exists
        await queryRunner.query(`DROP TABLE IF EXISTS "assets"`);

        // Create the new `assets` table with the updated columns
        await queryRunner.createTable(
            new Table({
                name: "assets",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                    },
                    {
                        name: "customer_id",
                        type: "varchar(255)",
                        isNullable: false,
                    },
                    {
                        name: "app_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "source_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "source_type_id",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "type",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "data",
                        type: "json",
                        isNullable: true,
                    },
                    {
                        name: "llm_summary",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "llm_embeddings_small",
                        type: "vector",
                        length: "1536",
                        isNullable: true,
                    },
                    {
                        name: "llm_embeddings_large",
                        type: "vector",
                        length: "3072",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                    {
                        name: "is_deleted",
                        type: "boolean",
                        default: false,
                        isNullable: false,
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the newly created `assets` table if rolling back
        await queryRunner.query(`DROP TABLE IF EXISTS "assets"`);

        // Optionally, you could recreate the old `assets` table here if you need a rollback
    }
}
