import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateTableUserCommets1741800127184 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'user_comments',
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
                    type: 'int',
                    isNullable: false,
                },
                {
                    name: 'standard_id',
                    type: 'int',
                    isNullable: false,
                },
                {
                    name: 'control_id',
                    type: 'int',
                    isNullable: true,
                },
                {
                    name: 'is_standard_level_comment',
                    type: 'boolean',
                    isNullable: false,
                },
                {
                    name: 'tags',
                    type: 'jsonb',
                    default: "'[]'",
                },
                {
                    name: 'comment',
                    type: 'text',
                    isNullable: true,
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
                {
                    name: 'is_deleted',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'created_by',
                    type: 'uuid',
                    isNullable: false,
                },
                {
                    name: 'updated_by',
                    type: 'uuid',
                    isNullable: true,
                }
            ],
        }), true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('user_comments');
    }

}
