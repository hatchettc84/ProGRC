import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTableNameSourceAddControlMapping1738218955226 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'source_v1' AND column_name = 'control_mapping'
                ) THEN
                    ALTER TABLE public.source_v1
                    ADD COLUMN control_mapping json NULL;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE public.source_v1
            DROP COLUMN IF EXISTS control_mapping;
        `);
    }

}
