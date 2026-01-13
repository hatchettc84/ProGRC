import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterSource1730821329036 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "source", // The name of the table
            "id", // The name of the column to change
            new TableColumn({
                name: "id",
                type: "int", // New type
                isPrimary: true,
                isGenerated: true, // Auto-generated
                isNullable: false, // Set according to your requirements
            })
        );

        await queryRunner.changeColumn(
            "source", // The name of the table
            "source_type", // The name of the column to change
            new TableColumn({
                name: "source_type",
                type: "int", // New type
                isNullable: false, // Adjust according to your needs
                // If you have constraints, add them here
                // e.g., default: 0, etc.
            })
        );

        await queryRunner.changeColumn(
            "source", // The name of the table
            "current_version", // The name of the column to change
            new TableColumn({
                name: "current_version",
                type: "int", // New type
                isNullable: true, // Adjust according to your needs
                // If you have constraints, add them here
                // e.g., default: 0, etc.
            })
        );

        await queryRunner.changeColumn(
            "source_version", // The name of the table
            "id", // The name of the column to change
            new TableColumn({
                name: "id",
                type: "int", // New type
                isPrimary: true,
                isGenerated: true, // Auto-generated
                isNullable: false, // Set according to your requirements
            })
        );

        await queryRunner.changeColumn(
            "source_version", // The name of the table
            "source_id", // The name of the column to change
            new TableColumn({
                name: "source_id",
                type: "int", // New type
                isNullable: false, // Adjust according to your needs
                // If you have constraints, add them here
                // e.g., default: 0, etc.
            })
        );

        await queryRunner.changeColumn(
            "source_types", // The name of the table
            "id", // The name of the column to change
            new TableColumn({
                name: "id",
                type: "int", // New type
                isPrimary: true,
                isGenerated: true, // Auto-generated
                isNullable: false, // Set according to your requirements
            })
        );

        await queryRunner.changeColumn(
            "application_source_type", // The name of the table
            "source_type", // The name of the column to change
            new TableColumn({
                name: "source_type",
                type: "int", // New type
                isNullable: false, // Adjust according to your needs
            })
        );

    }
    

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            "source", // The name of the table
            "id", // The name of the column to revert
            new TableColumn({
                name: "id",
                type: "uuid", // Original type
                isPrimary: true,
                isNullable: false, // Adjust according to your needs
            })
        );

        await queryRunner.changeColumn(
            "source", // The name of the table
            "source_type", // The name of the column to revert
            new TableColumn({
                name: "source_type",
                type: "uuid", // Original type
                isNullable: false, // Adjust according to your needs
                // Add other properties that existed before
            })
        );

        await queryRunner.changeColumn(
            "source", // The name of the table
            "current_version", // The name of the column to revert
            new TableColumn({
                name: "current_version",
                type: "uuid", // Original type
                isNullable: false, // Adjust according to your needs
                // Add other properties that existed before
            })
        );


        await queryRunner.changeColumn(
            "source_version", // The name of the table
            "id", // The name of the column to revert
            new TableColumn({
                name: "id",
                type: "uuid", // Original type
                isPrimary: true,
                isNullable: false, // Adjust according to your needs
            })
        );

        await queryRunner.changeColumn(
            "source_version", // The name of the table
            "source_id", // The name of the column to revert
            new TableColumn({
                name: "source_id",
                type: "uuid", // Original type
                isNullable: false, // Adjust according to your needs
                // Add other properties that existed before
            })
        );

        await queryRunner.changeColumn(
            "source_types", // The name of the table
            "id", // The name of the column to revert
            new TableColumn({
                name: "id",
                type: "uuid", // Original type
                isPrimary: true,
                isNullable: false, // Adjust according to your needs
            })
        );

        await queryRunner.changeColumn(
            "application_source_type", // The name of the table
            "source_type", // The name of the column to revert
            new TableColumn({
                name: "source_type",
                type: "uuid", // Original type
                isNullable: false, // Adjust according to your needs
                // Add other properties that existed before
            })
        );

    }

}
