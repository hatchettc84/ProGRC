import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

/**
 * Migration to create a test admin user for development/testing purposes
 * 
 * WARNING: This creates a user with:
 * - Email: admin@progrc.com
 * - Password: adminadmin
 * - Role: SuperAdmin (1)
 * 
 * This is for TESTING ONLY. Remove or disable this migration before production deployment.
 * 
 * To use this user:
 * - Email: admin@progrc.com
 * - Password: adminadmin
 */
export class CreateTestAdminUser1744000000000 implements MigrationInterface {
    name = 'CreateTestAdminUser1744000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if password_hash column exists
        const columnExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'password_hash'
        `);

        if (!columnExists || columnExists.length === 0) {
            console.log('password_hash column does not exist yet. Skipping test admin user creation.');
            console.log('This migration will be skipped until the auth table migration runs.');
            return;
        }

        // Check if password_history table exists
        const tableExists = await queryRunner.query(`
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'password_history'
        `);

        if (!tableExists || tableExists.length === 0) {
            console.log('password_history table does not exist yet. Skipping password history entry.');
        }

        // Check if test admin user already exists
        const existingUser = await queryRunner.query(
            `SELECT id FROM users WHERE email = 'admin@progrc.com'`
        );

        if (existingUser && existingUser.length > 0) {
            console.log('Test admin user already exists, skipping creation.');
            return;
        }

        // Generate password hash for "adminadmin" password (8 characters minimum)
        const passwordHash = bcrypt.hashSync('adminadmin', 10);
        const userId = uuidv4();
        const now = new Date().toISOString();

        // Escape the password hash for SQL (replace single quotes with double single quotes)
        const escapedPasswordHash = passwordHash.replace(/'/g, "''");

        // Insert test admin user
        // Role ID 1 = SuperAdmin (from UserRole enum)
        await queryRunner.query(`
            INSERT INTO users (
                id,
                email,
                name,
                password_hash,
                role_id,
                invite_status,
                is_locked,
                mfa_enabled,
                password_reset_required,
                created_at,
                updated_at,
                deleted
            ) VALUES (
                '${userId}',
                'admin@progrc.com',
                'Test Admin',
                '${escapedPasswordHash}',
                1,
                'JOINED',
                false,
                false,
                false,
                '${now}',
                '${now}',
                false
            )
        `);

        // Add to password history (only if table exists)
        if (tableExists && tableExists.length > 0) {
            await queryRunner.query(`
                INSERT INTO password_history (
                    user_id,
                    password_hash,
                    created_at
                ) VALUES (
                    '${userId}',
                    '${escapedPasswordHash}',
                    '${now}'
                )
            `);
        }

        console.log('Test admin user created successfully!');
        console.log('Email: admin@progrc.com');
        console.log('Password: adminadmin');
        console.log('WARNING: This is for testing only. Remove before production!');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove test admin user
        await queryRunner.query(`
            DELETE FROM password_history 
            WHERE user_id IN (
                SELECT id FROM users WHERE email = 'admin@progrc.com'
            )
        `);

        await queryRunner.query(`
            DELETE FROM users WHERE email = 'admin@progrc.com'
        `);

        console.log('Test admin user removed.');
    }
}

