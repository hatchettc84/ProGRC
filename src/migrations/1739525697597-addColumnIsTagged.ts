import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddColumnIsTagged1739525697597 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("control_chunk_mapping");

        if (!table?.findColumnByName("is_tagged")) {
            await queryRunner.addColumn("control_chunk_mapping", new TableColumn({
                name: "is_tagged",
                type: "boolean",
                isNullable: true,
                default: false,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("control_chunk_mapping");

        if (table?.findColumnByName("is_tagged")) {
            await queryRunner.dropColumn("control_chunk_mapping", "is_tagged");
        }
    }

}
