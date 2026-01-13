import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMfaTables1751200000000 implements MigrationInterface {
    name = 'CreateMfaTables1751200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create mfa_devices table
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "mfa_devices" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "type" varchar(50) NOT NULL,
                "status" varchar(50) NOT NULL DEFAULT 'PENDING',
                "name" varchar NULL,
                "secret" varchar NULL,
                "credential_id" varchar NULL,
                "public_key" text NULL,
                "counter" integer NULL,
                "is_primary" boolean NOT NULL DEFAULT false,
                "last_used_at" TIMESTAMP NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_mfa_devices" PRIMARY KEY ("id")
            )
        `);

        // Create email_otps table
        await queryRunner.query(`
            CREATE TABLE "email_otps" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "code" varchar NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "is_used" boolean NOT NULL DEFAULT false,
                "attempts" integer NOT NULL DEFAULT 0,
                "purpose" varchar NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_email_otps" PRIMARY KEY ("id")
            )
        `);

        // Create mfa_backup_codes table
        await queryRunner.query(`
            CREATE TABLE "mfa_backup_codes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "code_hash" varchar NOT NULL,
                "is_used" boolean NOT NULL DEFAULT false,
                "used_at" TIMESTAMP NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_mfa_backup_codes" PRIMARY KEY ("id")
            )
        `);

        // Create mfa_setup_sessions table
        await queryRunner.query(`
            CREATE TABLE "mfa_setup_sessions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "device_type" varchar(50) NOT NULL,
                "status" varchar(50) NOT NULL DEFAULT 'NOT_STARTED',
                "setup_data" jsonb NULL,
                "device_name" varchar NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "attempts" integer NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_mfa_setup_sessions" PRIMARY KEY ("id")
            )
        `);

        // Create security_policies table
        await queryRunner.query(`
            CREATE TABLE "security_policies" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" varchar NOT NULL,
                "type" varchar(50) NOT NULL,
                "scope" varchar(50) NOT NULL,
                "scope_id" varchar NULL,
                "rules" jsonb NOT NULL,
                "action" varchar(50) NOT NULL DEFAULT 'RECOMMEND',
                "is_active" boolean NOT NULL DEFAULT true,
                "priority" integer NOT NULL DEFAULT 0,
                "created_by" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_security_policies" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "mfa_devices" 
            ADD CONSTRAINT "FK_mfa_devices_user" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "email_otps" 
            ADD CONSTRAINT "FK_email_otps_user" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "mfa_backup_codes" 
            ADD CONSTRAINT "FK_mfa_backup_codes_user" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "mfa_setup_sessions" 
            ADD CONSTRAINT "FK_mfa_setup_sessions_user" 
            FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "security_policies" 
            ADD CONSTRAINT "FK_security_policies_creator" 
            FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT
        `);

        // Add indexes for performance
        await queryRunner.query(`
            CREATE INDEX "IDX_mfa_devices_user_id" ON "mfa_devices" ("user_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_mfa_devices_user_type" ON "mfa_devices" ("user_id", "type")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_mfa_devices_primary" ON "mfa_devices" ("user_id", "is_primary") WHERE "is_primary" = true
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_email_otps_user_purpose" ON "email_otps" ("user_id", "purpose", "is_used")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_email_otps_expires" ON "email_otps" ("expires_at")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_mfa_backup_codes_user_unused" ON "mfa_backup_codes" ("user_id", "is_used") WHERE "is_used" = false
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_mfa_setup_sessions_user_status" ON "mfa_setup_sessions" ("user_id", "status")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_mfa_setup_sessions_expires" ON "mfa_setup_sessions" ("expires_at")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_security_policies_scope" ON "security_policies" ("type", "scope", "scope_id", "is_active")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_security_policies_priority" ON "security_policies" ("priority" DESC, "created_at" DESC)
        `);

        // Add unique constraints
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_mfa_devices_primary_per_user" ON "mfa_devices" ("user_id") WHERE "is_primary" = true
        `);

        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_mfa_devices_credential" ON "mfa_devices" ("credential_id") WHERE "credential_id" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop unique constraints
        await queryRunner.query(`DROP INDEX "UQ_mfa_devices_credential"`);
        await queryRunner.query(`DROP INDEX "UQ_mfa_devices_primary_per_user"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_security_policies_priority"`);
        await queryRunner.query(`DROP INDEX "IDX_security_policies_scope"`);
        await queryRunner.query(`DROP INDEX "IDX_mfa_setup_sessions_expires"`);
        await queryRunner.query(`DROP INDEX "IDX_mfa_setup_sessions_user_status"`);
        await queryRunner.query(`DROP INDEX "IDX_mfa_backup_codes_user_unused"`);
        await queryRunner.query(`DROP INDEX "IDX_email_otps_expires"`);
        await queryRunner.query(`DROP INDEX "IDX_email_otps_user_purpose"`);
        await queryRunner.query(`DROP INDEX "IDX_mfa_devices_primary"`);
        await queryRunner.query(`DROP INDEX "IDX_mfa_devices_user_type"`);
        await queryRunner.query(`DROP INDEX "IDX_mfa_devices_user_id"`);

        // Drop foreign key constraints
        await queryRunner.query(`ALTER TABLE "security_policies" DROP CONSTRAINT "FK_security_policies_creator"`);
        await queryRunner.query(`ALTER TABLE "mfa_setup_sessions" DROP CONSTRAINT "FK_mfa_setup_sessions_user"`);
        await queryRunner.query(`ALTER TABLE "mfa_backup_codes" DROP CONSTRAINT "FK_mfa_backup_codes_user"`);
        await queryRunner.query(`ALTER TABLE "email_otps" DROP CONSTRAINT "FK_email_otps_user"`);
        await queryRunner.query(`ALTER TABLE "mfa_devices" DROP CONSTRAINT "FK_mfa_devices_user"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "security_policies"`);
        await queryRunner.query(`DROP TABLE "mfa_setup_sessions"`);
        await queryRunner.query(`DROP TABLE "mfa_backup_codes"`);
        await queryRunner.query(`DROP TABLE "email_otps"`);
        await queryRunner.query(`DROP TABLE "mfa_devices"`);
    }
} 