import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterAssetstableAddAssetsId1731394232145 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("assets", new TableColumn({
            name: "source_version",
            type: "int",
            isNullable: false,
        }));

        // Add the 'asset_id' column
        await queryRunner.addColumn("assets", new TableColumn({
            name: "asset_id",
            type: "character",
            length: "36",
            isNullable: false,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("assets", "asset_id");

        // Remove the 'source_version' column
        await queryRunner.dropColumn("assets", "source_version");
    }

}
