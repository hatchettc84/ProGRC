import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterAsyncTaskEnumToString1730723472750 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.changeColumn(
            'async_tasks',
            'status',
            new TableColumn({
                name: 'status',
                type: 'varchar', // Use varchar for string representation
                isNullable: false, // Adjust based on your requirements
                default: "'PENDING'" // Set default value if needed
            })
        );

        // Change the column type of 'ops' from enum to string
        await queryRunner.changeColumn(
            'async_tasks',
            'ops',
            new TableColumn({
                name: 'ops',
                type: 'varchar', // Use varchar for string representation
                isNullable: false, // Adjust based on your requirements
                default: "'CREATE_ASSETS'" // Set default value if needed
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'async_tasks',
            'status',
            new TableColumn({
                name: 'status',
                type: 'enum',
                enum: ['PENDING', 'PROCESSED', 'FAILED'], // Your original enum values
                isNullable: false,
                default: "'PENDING'" // Original default value
            })
        );

        // Revert the column type of 'ops' back to enum
        await queryRunner.changeColumn(
            'async_tasks',
            'ops',
            new TableColumn({
                name: 'ops',
                type: 'enum',
                enum: ['CREATE_ASSETS', 'CREATE_ASSESSMENTS', 'UPDATE_ASSETS', 'UPDATE_ASSESSMENTS', 'UPDATE_COMPLIANCE'], // Your original enum values
                isNullable: false,
                default: "'CREATE_ASSETS'" // Original default value
            })
        );
    
    }

}
