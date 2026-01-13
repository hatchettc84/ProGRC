import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateApplicationConnections1742299083697
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.application_connections (
                id SERIAL PRIMARY KEY,
                application_id INT8 NOT NULL,
                source_type INT4 NOT NULL,
                metadata JSON NOT NULL,
                created_at TIMESTAMP DEFAULT now() NOT NULL,
                updated_at TIMESTAMP DEFAULT now() NOT NULL
            );

            CREATE UNIQUE INDEX IF NOT EXISTS idx_application_connections_application_id_source_type ON public.application_connections (application_id, source_type);
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX IF EXISTS idx_application_connections_application_id_source_type;
            DROP TABLE IF EXISTS public.application_connections;
        `);
  }
}
