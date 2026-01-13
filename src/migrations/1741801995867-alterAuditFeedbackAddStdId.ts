import { MigrationInterface, QueryRunner, TableColumn, TableUnique } from "typeorm";

export class AlterAuditFeedbackAddStdId1741801995867 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('audit_feedback', new TableColumn({
            name: 'standard_id',
            type: 'int',
            isNullable: false,
        }));

        await queryRunner.addColumn('audit_feedback', new TableColumn({
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
        }));

        await queryRunner.addColumn('audit_feedback', new TableColumn({
            name: 'is_deleted',
            type: 'boolean',
            default: false,
            isNullable: false,
        }));

        await queryRunner.addColumn('audit_feedback', new TableColumn({
            name: 'is_updated_by_llm',
            type: 'boolean',
            default: false,
            isNullable: false,
        }));

        // Drop the existing unique constraint on control_id
        await queryRunner.query(`ALTER TABLE "audit_feedback" DROP CONSTRAINT "UQ_194df2499522a36423fa2772e5c"`);

        // Add the new unique constraint on app_id, standard_id, and control_id
        await queryRunner.createUniqueConstraint('audit_feedback', new TableUnique({
            name: 'UQ_app_standard_control',
            columnNames: ['app_id', 'standard_id', 'control_id'],
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the new unique constraint
        await queryRunner.dropUniqueConstraint('audit_feedback', 'UQ_app_standard_control');

        // Restore the old unique constraint on control_id
        await queryRunner.query(`ALTER TABLE "audit_feedback" ADD CONSTRAINT "UQ_194df2499522a36423fa2772e5c" UNIQUE ("control_id")`);

        await queryRunner.dropColumn('audit_feedback', 'standard_id');
        await queryRunner.dropColumn('audit_feedback', 'created_by');
        await queryRunner.dropColumn('audit_feedback', 'is_deleted');
    }
}