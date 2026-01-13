import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTableQuickstart1739117436998 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "check_list",
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                },
                {
                    name: "check_list_item",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "user_email",
                    type: "varchar",
                    isNullable: true,
                },

                {
                    name: "app_id",
                    type: "integer",
                    isNullable: true,
                },
                {
                    name: "customer_id",
                    type: "varchar",
                    isNullable: false,
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "(now() AT TIME ZONE 'UTC')",
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "(now() AT TIME ZONE 'UTC')",
                    onUpdate: "(now() AT TIME ZONE 'UTC')",
                },
            ],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("check_list");
    }

}
