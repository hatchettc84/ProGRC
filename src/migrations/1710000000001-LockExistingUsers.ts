import { MigrationInterface, QueryRunner } from "typeorm";

export class LockExistingUsers1710000000001 implements MigrationInterface {
    name = 'LockExistingUsers1710000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Lock all existing users and require password reset

        await queryRunner.query(`select 1`);
        // await queryRunner.query(`
        //     UPDATE "users"
        //     SET 
        //         "is_locked" = true,
        //         "password_reset_required" = true,
        //         "password_hash" = NULL
        //     WHERE "password_hash" IS NULL
        // `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`select 1`);
        // No down migration needed as this is a one-way change
    }
} 