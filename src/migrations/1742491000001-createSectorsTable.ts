import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSectorsTable1742491000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS sectors (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            COMMENT ON TABLE sectors IS 'Stores different industry sectors';
            COMMENT ON COLUMN sectors.id IS 'Unique identifier for the sector';
            COMMENT ON COLUMN sectors.name IS 'Name of the sector';
            COMMENT ON COLUMN sectors.description IS 'Description of the sector';

            -- Create indexes
            CREATE INDEX IF NOT EXISTS idx_sectors_name ON sectors(name);
            CREATE INDEX IF NOT EXISTS idx_sectors_created_at ON sectors(created_at);

            -- Create trigger for updated_at
            CREATE TRIGGER update_sectors_updated_at
                BEFORE UPDATE ON sectors
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop trigger
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_sectors_updated_at ON sectors;
        `);

        // Drop indexes
        await queryRunner.query(`
            DROP INDEX IF EXISTS idx_sectors_created_at;
            DROP INDEX IF EXISTS idx_sectors_name;
        `);

        // Drop table
        await queryRunner.query(`
            DROP TABLE IF EXISTS sectors;
        `);
    }
} 