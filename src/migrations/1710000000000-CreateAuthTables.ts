import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAuthTables1710000000000 implements MigrationInterface {
    name = 'CreateAuthTables1710000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add password_hash and auth-related columns to users table

        await queryRunner.query(`select 1`);
        // await queryRunner.query(`
        //     ALTER TABLE "users" 
        //     ADD COLUMN "password_hash" varchar NULL,
        //     ADD COLUMN "is_locked" boolean NOT NULL DEFAULT false,
        //     ADD COLUMN "mfa_enabled" boolean NOT NULL DEFAULT false,
        //     ADD COLUMN "mfa_type" varchar NULL,
        //     ADD COLUMN "totp_secret" varchar NULL,
        //     ADD COLUMN "passkey_credential_id" varchar NULL,
        //     ADD COLUMN "last_password_change" timestamp NULL,
        //     ADD COLUMN "password_reset_required" boolean NOT NULL DEFAULT false
        // `);

        // // Create password_history table
        // await queryRunner.query(`
        //     CREATE TABLE "password_history" (
        //         "id" SERIAL NOT NULL,
        //         "user_id" uuid NOT NULL,
        //         "password_hash" varchar NOT NULL,
        //         "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        //         CONSTRAINT "PK_password_history" PRIMARY KEY ("id")
        //     )
        // `);

        // // Create refresh_tokens table
        // await queryRunner.query(`
        //     CREATE TABLE "refresh_tokens" (
        //         "id" SERIAL NOT NULL,
        //         "user_id" uuid NOT NULL,
        //         "token" varchar NOT NULL,
        //         "expires_at" TIMESTAMP NOT NULL,
        //         "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        //         "revoked_at" TIMESTAMP NULL,
        //         CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
        //     )
        // `);

        // // Add foreign key constraints
        // await queryRunner.query(`
        //     ALTER TABLE "users" 
        //     ADD CONSTRAINT "UQ_users_id" UNIQUE ("id")
        // `);

        // await queryRunner.query(`
        //     ALTER TABLE "password_history" 
        //     ADD CONSTRAINT "FK_password_history_user" 
        //     FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        // `);

        // await queryRunner.query(`
        //     ALTER TABLE "refresh_tokens" 
        //     ADD CONSTRAINT "FK_refresh_tokens_user" 
        //     FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        // `);

        // // Add indexes
        // await queryRunner.query(`
        //     CREATE INDEX "IDX_password_history_user_id" ON "password_history" ("user_id")
        // `);

        // await queryRunner.query(`
        //     CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens" ("user_id")
        // `);

        // await queryRunner.query(`
        //     CREATE INDEX "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")
        // `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.query(`select 1`);
        // Drop indexes
        // await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_token"`);
        // await queryRunner.query(`DROP INDEX "IDX_refresh_tokens_user_id"`);
        // await queryRunner.query(`DROP INDEX "IDX_password_history_user_id"`);

        // // Drop foreign key constraints
        // await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_refresh_tokens_user"`);
        // await queryRunner.query(`ALTER TABLE "password_history" DROP CONSTRAINT "FK_password_history_user"`);

        // // Drop unique constraint
        // await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_users_id"`);

        // // Drop tables
        // await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        // await queryRunner.query(`DROP TABLE "password_history"`);

        // Drop columns from users table
        // await queryRunner.query(`
        //     ALTER TABLE "users" 
        //     DROP COLUMN "password_hash",
        //     DROP COLUMN "is_locked",
        //     DROP COLUMN "mfa_enabled",
        //     DROP COLUMN "mfa_type",
        //     DROP COLUMN "totp_secret",
        //     DROP COLUMN "passkey_credential_id",
        //     DROP COLUMN "last_password_change",
        //     DROP COLUMN "password_reset_required"
        // `);
    }
} 