import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterSourceChunkMapping1739184513934 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("source_chunk_mapping");
        
        if (!table?.findColumnByName("line_number")) {
            await queryRunner.addColumn("source_chunk_mapping", new TableColumn({
                name: "line_number",
                type: "int",
                isNullable: true,
            }));
        }
        
        if (!table?.findColumnByName("page_number")) {
            await queryRunner.addColumn("source_chunk_mapping", new TableColumn({
                name: "page_number",
                type: "int",
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("source_chunk_mapping");
        
        if (table?.findColumnByName("line_number")) {
            await queryRunner.dropColumn("source_chunk_mapping", "line_number");
        }
        
        if (table?.findColumnByName("page_number")) {
            await queryRunner.dropColumn("source_chunk_mapping", "page_number");
        }
    }

}
