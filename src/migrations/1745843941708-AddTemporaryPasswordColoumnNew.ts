import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTemporaryPasswordColoumnNew1745843941708 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add temporary password column if it doesn't exist
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' 
                    AND column_name = 'is_using_temporary_password'
                ) THEN
                    ALTER TABLE "users" ADD "is_using_temporary_password" boolean NOT NULL DEFAULT false;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop temporary password column if it exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'users' 
                    AND column_name = 'is_using_temporary_password'
                ) THEN
                    ALTER TABLE "users" DROP COLUMN "is_using_temporary_password";
                END IF;
            END $$;
        `);
    }

}
