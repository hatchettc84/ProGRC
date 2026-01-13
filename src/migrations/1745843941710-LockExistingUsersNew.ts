import { MigrationInterface, QueryRunner } from "typeorm";

export class LockExistingUsersNew1745843941710 implements MigrationInterface {
    

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Lock all existing users and require password reset if the required columns exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                -- Check if all required columns exist before updating
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'is_locked'
                ) AND EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'password_reset_required'
                ) AND EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'password_hash'
                ) THEN
                    -- Lock all existing users and require password reset
                    UPDATE "users"
                    SET 
                        "is_locked" = true,
                        "password_reset_required" = true,
                        "password_hash" = NULL
                    WHERE "password_hash" IS NULL;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Unlock users and remove password reset requirement if columns exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                -- Check if all required columns exist before updating
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'is_locked'
                ) AND EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'password_reset_required'
                ) THEN
                    -- Unlock users and remove password reset requirement
                    UPDATE "users"
                    SET 
                        "is_locked" = false,
                        "password_reset_required" = false
                    WHERE "is_locked" = true AND "password_reset_required" = true;
                END IF;
            END $$;
        `);
    }
}
