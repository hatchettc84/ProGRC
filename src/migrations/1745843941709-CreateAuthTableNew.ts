import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTableNew1745843941709 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add password_hash and auth-related columns to users table if they don't exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                -- Add password_hash column if not exists
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'password_hash'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "password_hash" varchar NULL;
                END IF;
                
                -- Add is_locked column if not exists
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'is_locked'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "is_locked" boolean NOT NULL DEFAULT false;
                END IF;
                
                -- Add mfa_enabled column if not exists
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'mfa_enabled'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "mfa_enabled" boolean NOT NULL DEFAULT false;
                END IF;
                
                -- Add mfa_type column if not exists
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'mfa_type'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "mfa_type" varchar NULL;
                END IF;
                
                -- Add totp_secret column if not exists
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'totp_secret'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "totp_secret" varchar NULL;
                END IF;
                
                -- Add passkey_credential_id column if not exists
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'passkey_credential_id'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "passkey_credential_id" varchar NULL;
                END IF;
                
                -- Add last_password_change column if not exists
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'last_password_change'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "last_password_change" timestamp NULL;
                END IF;
                
                -- Add password_reset_required column if not exists
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'password_reset_required'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "password_reset_required" boolean NOT NULL DEFAULT false;
                END IF;
            END $$;
        `);

        // Create password_history table if not exists
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "password_history" (
                "id" SERIAL NOT NULL,
                "user_id" uuid NOT NULL,
                "password_hash" varchar NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_password_history" PRIMARY KEY ("id")
            )
        `);

        // Create refresh_tokens table if not exists
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "refresh_tokens" (
                "id" SERIAL NOT NULL,
                "user_id" uuid NOT NULL,
                "token" varchar NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "revoked_at" TIMESTAMP NULL,
                CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
            )
        `);

        // Add unique constraint to users table if not exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'UQ_users_id' AND table_name = 'users'
                ) THEN
                    ALTER TABLE "users" ADD CONSTRAINT "UQ_users_id" UNIQUE ("id");
                END IF;
            END $$;
        `);

        // Add foreign key constraints if not exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_password_history_user' AND table_name = 'password_history'
                ) THEN
                    ALTER TABLE "password_history" 
                    ADD CONSTRAINT "FK_password_history_user" 
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints 
                    WHERE constraint_name = 'FK_refresh_tokens_user' AND table_name = 'refresh_tokens'
                ) THEN
                    ALTER TABLE "refresh_tokens" 
                    ADD CONSTRAINT "FK_refresh_tokens_user" 
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
                END IF;
            END $$;
        `);

        // Add indexes if not exist
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_password_history_user_id" ON "password_history" ("user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes if exist
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_refresh_tokens_token"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_refresh_tokens_user_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_password_history_user_id"`);

        // Drop foreign key constraints if exist
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT IF EXISTS "FK_refresh_tokens_user"`);
        await queryRunner.query(`ALTER TABLE "password_history" DROP CONSTRAINT IF EXISTS "FK_password_history_user"`);

        // Drop unique constraint if exists
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_id"`);

        // Drop tables if exist
        await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "password_history"`);

        // Drop columns from users table if they exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'password_hash'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "password_hash";
                END IF;
                
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'is_locked'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "is_locked";
                END IF;
                
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'mfa_enabled'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "mfa_enabled";
                END IF;
                
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'mfa_type'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "mfa_type";
                END IF;
                
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'totp_secret'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "totp_secret";
                END IF;
                
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'passkey_credential_id'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "passkey_credential_id";
                END IF;
                
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'last_password_change'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "last_password_change";
                END IF;
                
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'password_reset_required'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "password_reset_required";
                END IF;
            END $$;
        `);
    }
}
