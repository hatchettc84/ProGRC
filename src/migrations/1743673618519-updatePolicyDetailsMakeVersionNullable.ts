import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePolicyDetailsMakeVersionNullable1743673618519 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'policy_details' 
                    AND column_name = 'version'
                ) THEN
                    ALTER TABLE policy_details 
                    ALTER COLUMN version DROP NOT NULL;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'policy_details' 
                    AND column_name = 'version'
                ) THEN
                    ALTER TABLE policy_details 
                    ALTER COLUMN version SET NOT NULL;
                END IF;
            END $$;
        `);
    }

}
