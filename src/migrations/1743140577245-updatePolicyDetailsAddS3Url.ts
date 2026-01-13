import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePolicyDetailsAddS3Url1743140577245 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'policy_details' 
                    AND column_name = 'referenceS3Url'
                ) THEN
                    ALTER TABLE policy_details 
                    ADD COLUMN referenceS3Url TEXT;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE policy_details 
            DROP COLUMN referenceS3Url;
        `);
    }

}
