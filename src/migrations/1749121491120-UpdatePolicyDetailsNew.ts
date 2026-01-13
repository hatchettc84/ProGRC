import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePolicyDetailsNew1749121491120 implements MigrationInterface {
    name = 'UpdatePolicyDetailsNew1749121491120'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, create a temporary column for appIds if not exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'policy_details' AND column_name = 'app_ids'
                ) THEN
                    ALTER TABLE "policy_details" ADD "app_ids" integer[];
                END IF;
            END $$;
        `);
        
        // Create a temporary column for references3urls if not exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'policy_details' AND column_name = 'references3urls'
                ) THEN
                    ALTER TABLE "policy_details" ADD "references3urls" text[];
                END IF;
            END $$;
        `);
        
        // Migrate existing references3url data to the new array format if old column exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'policy_details' AND column_name = 'references3url'
                ) THEN
                    UPDATE "policy_details"
                    SET "references3urls" = CASE 
                        WHEN "references3url" IS NOT NULL AND "references3url" != '' 
                        THEN ARRAY["references3url"]
                        ELSE '{}'
                    END;
                END IF;
            END $$;
        `);
        
        // Drop the old references3url column if it exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'policy_details' AND column_name = 'references3url'
                ) THEN
                    ALTER TABLE "policy_details" DROP COLUMN "references3url";
                END IF;
            END $$;
        `);
        
        // Rename the temporary columns to their final names if they exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'policy_details' AND column_name = 'app_ids'
                ) AND NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'policy_details' AND column_name = 'appIds'
                ) THEN
                    ALTER TABLE "policy_details" RENAME COLUMN "app_ids" TO "appIds";
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Create a temporary column for the old references3url if not exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'policy_details' AND column_name = 'references3url'
                ) THEN
                    ALTER TABLE "policy_details" ADD "references3url" character varying;
                END IF;
            END $$;
        `);
        
        // Migrate data back to the old format if new column exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'policy_details' AND column_name = 'references3urls'
                ) THEN
                    UPDATE "policy_details"
                    SET "references3url" = CASE 
                        WHEN "references3urls" IS NOT NULL AND array_length("references3urls", 1) > 0 
                        THEN "references3urls"[1]
                        ELSE NULL
                    END;
                END IF;
            END $$;
        `);
        
        // Drop the new columns if they exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'policy_details' AND column_name = 'references3urls'
                ) THEN
                    ALTER TABLE "policy_details" DROP COLUMN "references3urls";
                END IF;
            END $$;
        `);
        
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'policy_details' AND column_name = 'appIds'
                ) THEN
                    ALTER TABLE "policy_details" DROP COLUMN "appIds";
                END IF;
            END $$;
        `);
    }
}
