import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnusedMfaColumnsFromUsers1751300000000 implements MigrationInterface {
    name = 'RemoveUnusedMfaColumnsFromUsers1751300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the unused MFA columns from users table
        // These columns are no longer used as MFA data is now stored in dedicated tables
        
        // Remove mfa_type column (replaced by primary_mfa_type and mfa_devices table)
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "mfa_type"
        `);

        // Remove totp_secret column (TOTP secrets now stored in mfa_devices table)
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "totp_secret"
        `);

        // Remove passkey_credential_id column (PassKey data now stored in mfa_devices table)
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN "passkey_credential_id"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restore the columns if needed (for rollback purposes)
        
        // Add back passkey_credential_id column
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "passkey_credential_id" varchar NULL
        `);

        // Add back totp_secret column
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "totp_secret" varchar NULL
        `);

        // Add back mfa_type column
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN "mfa_type" varchar NULL
        `);

        // Note: Original data cannot be restored as it was migrated to mfa_devices table
        // This rollback only restores the column structure
    }
} 