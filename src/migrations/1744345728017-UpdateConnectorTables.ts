import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateConnectorTables1744345728017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_application_connections_application_id_source_type;

            ALTER TABLE application_connections
            ADD COLUMN IF NOT EXISTS source_id VARCHAR(255) DEFAULT NULL;

            ALTER TABLE application_connections
            ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_application_connections_application_id_source_type ON public.application_connections (application_id, source_type);

            ALTER TABLE application_connections
            DROP COLUMN IF EXISTS source_id;

            ALTER TABLE application_connections
            DROP COLUMN IF EXISTS last_synced_at;
        `);
  }
}
