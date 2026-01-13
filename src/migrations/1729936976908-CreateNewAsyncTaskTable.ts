import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateNewAsyncTaskTable1729936976908 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'async_tasks',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                        primaryKeyConstraintName: 'PK_async_tasks_id',
                    },
                    {
                        name: 'customer_id',
                        type: 'varchar(255)',
                    },
                    {
                        name: 'app_id',
                        type: 'bigint',
                    },
                    {
                        name: 'ops',
                        type: 'enum',
                        enum: ['CREATE_ASSETS', 'CREATE_ASSESSMENTS', 'UPDATE_ASSETS', 'UPDATE_ASSESSMENTS'],
                    },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: [
                            'PENDING',
                            'PROCESSING',
                            'PROCESSED',
                            'FAILED',
                            'REQUEST_INITIATED',
                            'RESPONSE_RECEIVED',
                        ],
                    },
                    {
                        name: 'request_payload',
                        type: 'json',
                    },

                    {
                        name: 'created_by',
                        type: 'uuid',
                    },

                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('async_tasks');

    }

}
