import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnsToPolicyDetails1744206970075 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add is_locked column with default value false


        // Add status column as nullable string
        await queryRunner.query(`
            ALTER TABLE policy_details 
            ADD COLUMN IF NOT EXISTS status VARCHAR(50);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the columns in the down migration
        await queryRunner.query(`
            ALTER TABLE policy_details 
            DROP COLUMN IF EXISTS status;
        `);
    }
} 