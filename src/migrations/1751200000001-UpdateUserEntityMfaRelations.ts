import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntityMfaRelations1751200000001 implements MigrationInterface {
    name = 'UpdateUserEntityMfaRelations1751200000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new MFA-related columns to users table
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "primary_mfa_type" varchar(50) NULL
        `);

        // Migrate existing MFA data if it exists
        await queryRunner.query(`
            UPDATE "users" 
            SET "primary_mfa_type" = "mfa_type" 
            WHERE "mfa_type" IS NOT NULL AND "mfa_enabled" = true
        `);

        // For users with existing TOTP setup, create MFA device records
        await queryRunner.query(`
            INSERT INTO "mfa_devices" ("user_id", "type", "status", "name", "secret", "is_primary", "created_at", "updated_at")
            SELECT 
                "id",
                'TOTP',
                'ACTIVE',
                'Authenticator App',
                "totp_secret",
                true,
                COALESCE("created_at", now()),
                COALESCE("updated_at", now())
            FROM "users" 
            WHERE "mfa_enabled" = true 
            AND "mfa_type" = 'TOTP' 
            AND "totp_secret" IS NOT NULL
        `);

        // For users with existing PassKey setup, create MFA device records
        await queryRunner.query(`
            INSERT INTO "mfa_devices" ("user_id", "type", "status", "name", "credential_id", "is_primary", "created_at", "updated_at")
            SELECT 
                "id",
                'PASSKEY',
                'ACTIVE',
                'Security Key',
                "passkey_credential_id",
                true,
                COALESCE("created_at", now()),
                COALESCE("updated_at", now())
            FROM "users" 
            WHERE "mfa_enabled" = true 
            AND "mfa_type" = 'PASSKEY' 
            AND "passkey_credential_id" IS NOT NULL
        `);

        // Add index for primary MFA type
        await queryRunner.query(`
            CREATE INDEX "IDX_users_primary_mfa_type" ON "users" ("primary_mfa_type") WHERE "primary_mfa_type" IS NOT NULL
        `);

        // Add index for MFA enabled users
        await queryRunner.query(`
            CREATE INDEX "IDX_users_mfa_enabled" ON "users" ("mfa_enabled") WHERE "mfa_enabled" = true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_users_mfa_enabled"`);
        await queryRunner.query(`DROP INDEX "IDX_users_primary_mfa_type"`);

        // Remove MFA device records that were migrated
        await queryRunner.query(`
            DELETE FROM "mfa_devices" 
            WHERE "name" IN ('Authenticator App', 'Security Key')
            AND "created_at" = "updated_at"
        `);

        // Remove new columns
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "primary_mfa_type"
        `);
    }
} 