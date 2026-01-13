import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSourceAssetsTable1729847931072 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'application_source_type',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'app_id',
                        type: 'bigint',
                    },
                    {
                        name: 'source_type',
                        type: 'int',
                    },
                    {
                        name: 'customer_id',
                        type: 'varchar(255)',
                    },
                    {
                        name: 'source_count',
                        type: 'int',
                        isNullable: true
                    },
                    {
                        name: 'assets_count',
                        type: 'int',
                        isNullable: true
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
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('application_source_type');
    }

}
