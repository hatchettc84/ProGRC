import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateAuditFeedbackTable1741528244320 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('audit_feedback');
        if (!tableExists) {
            await queryRunner.createTable(new Table({
                name: 'audit_feedback',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'control_id',
                        type: 'int',
                        isUnique: true,
                    },
                    {
                        name: 'app_id',
                        type: 'int',
                    },
                    {
                        name: 'feedback_status',
                        type: 'varchar',
                        default: "'clear'",
                    },
                    {
                        name: 'feedback_notes',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'auditor_id',
                        type: 'varchar',
                        isNullable: true,
                    },

                    {
                        name: 'customer_id',
                        type: 'varchar',
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
                        isNullable: true,
                    },
                    {
                        name: 'updated_by',
                        type: 'varchar',
                        isNullable: true,
                    },
                ],
            }), true);

        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('audit_feedback');
    }

}
