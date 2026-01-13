import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterApplicationSourceType1730827796570 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "application_source_type",
            "source_count",
            new TableColumn({
                name: "source_count",
                type: "int",
                isNullable: true, // Make column nullable
            })
        );

        await queryRunner.changeColumn(
            "application_source_type",
            "assets_count",
            new TableColumn({
                name: "assets_count",
                type: "int",
                isNullable: true, // Make column nullable
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "application_source_type",
            "source_count",
            new TableColumn({
                name: "source_count",
                type: "int",
                isNullable: false, // Revert column to non-nullable
            })
        );

        await queryRunner.changeColumn(
            "application_source_type",
            "assets_count",
            new TableColumn({
                name: "assets_count",
                type: "int",
                isNullable: false, // Revert column to non-nullable
            })
        );
    }

}
