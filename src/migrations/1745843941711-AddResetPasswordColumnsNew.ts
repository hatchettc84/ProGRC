import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResetPasswordColumnsNew1745843941711 implements MigrationInterface {
 

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add reset_password_code column if not exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'reset_password_code'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "reset_password_code" character varying;
                END IF;
            END $$;
        `);

        // Add reset_password_expires column if not exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'reset_password_expires'
                ) THEN
                    ALTER TABLE "users" ADD COLUMN "reset_password_expires" TIMESTAMP;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop reset_password_expires column if exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'reset_password_expires'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "reset_password_expires";
                END IF;
            END $$;
        `);

        // Drop reset_password_code column if exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' AND column_name = 'reset_password_code'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "reset_password_code";
                END IF;
            END $$;
        `);
    }
}
