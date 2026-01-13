import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOrganizationIdFromUserNew1745843941713 implements MigrationInterface {
    name = 'RemoveOrganizationIdFromUserNew1751636650378'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove organization_id column if it exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'organization_id'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "organization_id";
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add organization_id column back if it doesn't exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'organization_id'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "organization_id" uuid NULL;
                END IF;
            END $$;
        `);
    }
}
