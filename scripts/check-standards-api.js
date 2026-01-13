#!/usr/bin/env node

/**
 * Script to test the standards API endpoint
 * This helps diagnose why standards aren't showing up
 */

const axios = require('axios');

async function checkStandardsAPI() {
  try {
    console.log('Testing /onboarding/standards API endpoint...\n');
    
    // Try to call the API (you'll need to provide a valid JWT token)
    // For now, just check if the endpoint exists
    console.log('To test the API, you need to:');
    console.log('1. Get a JWT token from logging in');
    console.log('2. Call: curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/v1/onboarding/standards\n');
    
    // Check if backend is running
    try {
      const healthCheck = await axios.get('http://localhost:3000/api/v1/health', { timeout: 5000 });
      console.log('✓ Backend is running');
    } catch (error) {
      console.log('✗ Backend is not accessible at http://localhost:3000');
      console.log('  Make sure Docker containers are running: docker-compose ps');
      return;
    }
    
    console.log('\nNext steps:');
    console.log('1. Check if standards exist in database:');
    console.log('   docker-compose exec app node scripts/check-database-state.js');
    console.log('\n2. If no standards found, import them:');
    console.log('   ./scripts/import-all-data.sh');
    console.log('\n3. Check backend logs for errors:');
    console.log('   docker-compose logs app | grep -i standard');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkStandardsAPI();

