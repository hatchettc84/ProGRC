#!/usr/bin/env node

/**
 * Diagnostic script to check database state for compliance standards
 * Usage: node scripts/check-database-state.js
 */

const { Client } = require('pg');

const client = new Client({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USERNAME || 'progrc',
  password: process.env.POSTGRES_PASSWORD || 'progrc_dev_password_change_me',
  database: process.env.POSTGRES_DATABASE || 'progrc_bff'
});

async function checkDatabase() {
  try {
    await client.connect();
    console.log('✓ Connected to database\n');

    // Check frameworks
    console.log('=== FRAMEWORKS ===');
    const frameworks = await client.query('SELECT id, name, active FROM framework ORDER BY id');
    if (frameworks.rows.length === 0) {
      console.log('❌ No frameworks found! This is the problem.');
      console.log('   Solution: Run migration ResetExistingFrameworkAndDumpNew1742490012265\n');
    } else {
      console.log(`✓ Found ${frameworks.rows.length} frameworks:`);
      frameworks.rows.forEach(f => {
        console.log(`   ID: ${f.id} - ${f.name} (Active: ${f.active})`);
      });
      console.log('');
    }

    // Check standards
    console.log('=== STANDARDS ===');
    const standards = await client.query('SELECT id, name, framework_id, active FROM standard ORDER BY id');
    if (standards.rows.length === 0) {
      console.log('❌ No standards found!');
      console.log('   Solution: Run migration ResetExistingStandardAndDumpNew1742490012266\n');
    } else {
      console.log(`✓ Found ${standards.rows.length} standards:`);
      standards.rows.forEach(s => {
        const frameworkName = frameworks.rows.find(f => f.id === s.framework_id)?.name || 'Unknown';
        console.log(`   ID: ${s.id} - ${s.name} (Framework: ${s.framework_id} - ${frameworkName}, Active: ${s.active})`);
      });
      console.log('');

      // Check for standards with invalid framework_id
      const invalidStandards = standards.rows.filter(s => {
        return !frameworks.rows.find(f => f.id === s.framework_id);
      });
      if (invalidStandards.length > 0) {
        console.log('⚠️  WARNING: Standards with invalid framework_id:');
        invalidStandards.forEach(s => {
          console.log(`   Standard ID ${s.id} (${s.name}) references framework_id ${s.framework_id} which doesn't exist`);
        });
        console.log('');
      }
    }

    // Check controls
    console.log('=== CONTROLS ===');
    const controls = await client.query('SELECT COUNT(*) as count FROM control');
    console.log(`✓ Found ${controls.rows[0].count} controls\n`);

    // Check control mappings
    console.log('=== CONTROL MAPPINGS ===');
    const mappings = await client.query('SELECT COUNT(*) as count FROM standard_control_mapping');
    console.log(`✓ Found ${mappings.rows[0].count} control mappings\n`);

    // Check migrations
    console.log('=== RECENT MIGRATIONS ===');
    const migrations = await client.query(`
      SELECT name, timestamp 
      FROM migrations 
      WHERE name LIKE '%Framework%' OR name LIKE '%Standard%' OR name LIKE '%Control%'
      ORDER BY timestamp DESC 
      LIMIT 10
    `);
    if (migrations.rows.length > 0) {
      console.log('Recent compliance-related migrations:');
      migrations.rows.forEach(m => {
        console.log(`   ${m.name} (${new Date(parseInt(m.timestamp)).toISOString()})`);
      });
    } else {
      console.log('No compliance-related migrations found');
    }

    await client.end();
    console.log('\n✓ Database check complete');

  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

checkDatabase();

