import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration to create a test organization and assign it to the test admin user
 * This allows the test admin to access standards and create applications
 * 
 * This is for TESTING ONLY. Remove before production deployment.
 */
export class CreateTestOrganizationForAdmin1744000000001 implements MigrationInterface {
    name = 'CreateTestOrganizationForAdmin1744000000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if test admin user exists
        const adminUser = await queryRunner.query(
            `SELECT id, customer_id FROM users WHERE email = 'admin@progrc.com'`
        );

        if (!adminUser || adminUser.length === 0) {
            console.log('Test admin user not found, skipping organization creation.');
            return;
        }

        const adminUserId = adminUser[0].id;
        const existingCustomerId = adminUser[0].customer_id;

        // If admin already has a customer_id, skip
        if (existingCustomerId) {
            console.log('Test admin user already has an organization, skipping creation.');
            return;
        }

        // Generate a unique customer ID (using the same function as the app)
        const customerId = await queryRunner.query(`
            SELECT generate_unique_short_id() as id
        `);
        const newCustomerId = customerId[0].id;

        // Create test organization
        await queryRunner.query(`
            INSERT INTO customers (
                id,
                organization_name,
                owner_id,
                created_by,
                is_onboarding_complete,
                created_at,
                updated_at,
                deleted
            ) VALUES (
                '${newCustomerId}',
                'Test Organization',
                '${adminUserId}',
                '${adminUserId}',
                true,
                NOW(),
                NOW(),
                false
            )
        `);

        // Update admin user to link to the organization
        await queryRunner.query(`
            UPDATE users 
            SET customer_id = '${newCustomerId}',
                updated_at = NOW()
            WHERE id = '${adminUserId}'
        `);

        // Add all active standards to the organization
        // Note: customer_standards table id is auto-generated (BIGSERIAL or UUID depending on migration)
        await queryRunner.query(`
            INSERT INTO customer_standards (customer_id, standard_id, created_by, created_at, updated_at, deleted)
            SELECT '${newCustomerId}', id, '${adminUserId}', NOW(), NOW(), false
            FROM standard
            WHERE active = true
            AND NOT EXISTS (
                SELECT 1 FROM customer_standards 
                WHERE customer_id = '${newCustomerId}' AND standard_id = standard.id
            )
        `);

        console.log('Test organization created successfully!');
        console.log('Organization ID:', newCustomerId);
        console.log('Organization Name: Test Organization');
        console.log('All active standards have been added to the organization.');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Find the test organization
        const testOrg = await queryRunner.query(`
            SELECT id FROM customers 
            WHERE organization_name = 'Test Organization' 
            AND owner_id IN (SELECT id FROM users WHERE email = 'admin@progrc.com')
        `);

        if (testOrg && testOrg.length > 0) {
            const orgId = testOrg[0].id;

            // Remove organization standards
            await queryRunner.query(`
                DELETE FROM customer_standards WHERE customer_id = '${orgId}'
            `);

            // Remove customer_id from admin user
            await queryRunner.query(`
                UPDATE users 
                SET customer_id = NULL
                WHERE email = 'admin@progrc.com'
            `);

            // Delete the organization
            await queryRunner.query(`
                DELETE FROM customers WHERE id = '${orgId}'
            `);

            console.log('Test organization removed.');
        }
    }
}

