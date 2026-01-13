import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePoamTable1742968159220 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS poam_table (
                id SERIAL PRIMARY KEY,
                jira_id VARCHAR(50) UNIQUE DEFAULT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'Unassigned' 
                    CHECK (status IN ('Unassigned', 'Pending', 'In-Progress', 'Under-Review', 'Validated', 'Invalid')),
                priority VARCHAR(20) NOT NULL DEFAULT 'Medium'
                    CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
                control_ids JSONB NOT NULL,
                standard_ids JSONB NOT NULL,
                application_id VARCHAR(50) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_by VARCHAR(100),
                updated_by VARCHAR(100),
                current_assigned VARCHAR(100),
                base_recommendation_grouping JSONB NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_poam_application_id ON poam_table(application_id);
            CREATE INDEX IF NOT EXISTS idx_poam_status ON poam_table(status);
            CREATE INDEX IF NOT EXISTS idx_poam_priority ON poam_table(priority);
            CREATE INDEX IF NOT EXISTS idx_poam_control_ids ON poam_table USING GIN(control_ids);
            CREATE INDEX IF NOT EXISTS idx_poam_standard_ids ON poam_table USING GIN(standard_ids);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_poam_application_id;
            DROP INDEX IF EXISTS idx_poam_status;
            DROP INDEX IF EXISTS idx_poam_priority;
            DROP INDEX IF EXISTS idx_poam_control_ids;
            DROP INDEX IF EXISTS idx_poam_standard_ids;
            DROP TABLE IF EXISTS poam_table;
        `);
    }
} 