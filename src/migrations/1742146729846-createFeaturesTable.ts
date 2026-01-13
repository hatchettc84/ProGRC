import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFeaturesTable1742146729846 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS public.features (
                id SERIAL PRIMARY KEY,
                customer_id VARCHAR NOT NULL,
                key VARCHAR NOT NULL,
                flag BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_customer_key UNIQUE (customer_id, key)
            );

            CREATE INDEX idx_features_customer_id ON public.features(customer_id);
            CREATE INDEX idx_features_key ON public.features(key);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS public.features;
        `);
    }
} 