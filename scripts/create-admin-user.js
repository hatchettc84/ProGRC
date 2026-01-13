/**
 * Script to create an admin user
 * Usage: node scripts/create-admin-user.js
 * 
 * Creates a user with:
 * - Email: admin@rogrc.com
 * - Password: adminadmin
 * - Role: SuperAdmin
 */

const { execSync } = require('child_process');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Database connection details from environment
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'progrc_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';

// User details
const userEmail = 'admin@rogrc.com';
const userPassword = 'adminadmin';
const userName = 'Admin User';
const userRoleId = 1; // SuperAdmin

async function createAdminUser() {
    try {
        console.log('🔐 Creating admin user...');
        console.log(`Email: ${userEmail}`);
        console.log(`Password: ${userPassword}`);
        console.log(`Role: SuperAdmin (ID: ${userRoleId})`);
        console.log('');

        // Generate password hash
        const passwordHash = bcrypt.hashSync(userPassword, 10);
        const userId = uuidv4();
        const now = new Date().toISOString();

        // Escape values for SQL
        const escapedEmail = userEmail.replace(/'/g, "''");
        const escapedName = userName.replace(/'/g, "''");
        const escapedPasswordHash = passwordHash.replace(/'/g, "''");

        // Build PostgreSQL connection string
        const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
        
        // Use psql to execute SQL
        const sql = `
-- Check if user already exists
DO $$
DECLARE
    existing_user_id UUID;
    password_history_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT id INTO existing_user_id FROM users WHERE email = '${escapedEmail}';
    
    IF existing_user_id IS NOT NULL THEN
        RAISE NOTICE 'User with email ${escapedEmail} already exists. Updating...';
        
        -- Update existing user
        UPDATE users 
        SET 
            name = '${escapedName}',
            password_hash = '${escapedPasswordHash}',
            role_id = ${userRoleId},
            invite_status = 'JOINED',
            is_locked = false,
            mfa_enabled = false,
            password_reset_required = false,
            updated_at = '${now}',
            deleted = false
        WHERE email = '${escapedEmail}';
        
        -- Update password history if table exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'password_history'
        ) INTO password_history_exists;
        
        IF password_history_exists THEN
            INSERT INTO password_history (user_id, password_hash, created_at)
            VALUES (existing_user_id, '${escapedPasswordHash}', '${now}')
            ON CONFLICT DO NOTHING;
        END IF;
        
        RAISE NOTICE 'User updated successfully!';
    ELSE
        -- Create new user
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
            '${escapedEmail}',
            '${escapedName}',
            '${escapedPasswordHash}',
            ${userRoleId},
            'JOINED',
            false,
            false,
            false,
            '${now}',
            '${now}',
            false
        );
        
        -- Add to password history if table exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'password_history'
        ) INTO password_history_exists;
        
        IF password_history_exists THEN
            INSERT INTO password_history (user_id, password_hash, created_at)
            VALUES ('${userId}', '${escapedPasswordHash}', '${now}');
        END IF;
        
        RAISE NOTICE 'User created successfully!';
    END IF;
END $$;
        `;

        // Execute SQL using psql
        const command = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -c "${sql.replace(/\n/g, ' ').replace(/\s+/g, ' ')}"`;
        
        console.log('Executing SQL...');
        execSync(command, { stdio: 'inherit' });
        
        console.log('');
        console.log('✅ Admin user created/updated successfully!');
        console.log('');
        console.log('Login credentials:');
        console.log(`  Email: ${userEmail}`);
        console.log(`  Password: ${userPassword}`);
        console.log('');
        
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        console.error('');
        console.error('Make sure:');
        console.error('  1. Database is running and accessible');
        console.error('  2. Environment variables are set correctly');
        console.error('  3. You have psql installed and in PATH');
        console.error('  4. Database user has INSERT/UPDATE permissions');
        process.exit(1);
    }
}

// Run the script
createAdminUser();

