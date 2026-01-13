import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFeatureFlagTable1737618019068 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.feature_flags
            (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description VARCHAR(255) NOT NULL,
                is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
                is_globally_enabled BOOLEAN DEFAULT FALSE NOT NULL,
                whitelist TEXT[] DEFAULT '{}' NOT NULL,
                blacklist TEXT[] DEFAULT '{}' NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NULL
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS public.feature_flags;`);
    }
}
