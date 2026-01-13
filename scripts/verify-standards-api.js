#!/usr/bin/env node

/**
 * Verify that standards are available via API
 * This checks both database and API endpoints
 */

const http = require('http');

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

console.log('Checking standards availability...\n');

// First, check if we can get standards without auth (some endpoints might be public)
const checkStandards = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/standards',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 401) {
          // 401 means endpoint exists but needs auth - that's okay
          try {
            const json = JSON.parse(data);
            resolve({ status: res.statusCode, data: json });
          } catch (e) {
            resolve({ status: res.statusCode, data: data });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

checkStandards()
  .then(result => {
    console.log(`✓ API endpoint responded with status ${result.status}`);
    if (result.status === 401) {
      console.log('  (Authentication required - this is normal)');
      console.log('\nTo test with authentication, you need to:');
      console.log('  1. Login via frontend or API');
      console.log('  2. Get an access token');
      console.log('  3. Use the token in the Authorization header');
    } else if (result.data && result.data.data) {
      console.log(`  Found ${result.data.data.length} standards`);
      result.data.data.forEach(s => {
        console.log(`    - ${s.name} (ID: ${s.id}, Active: ${s.active})`);
      });
    }
  })
  .catch(error => {
    console.error('✗ API check failed:', error.message);
    console.log('\nThis could mean:');
    console.log('  1. Backend is not running on port 3000');
    console.log('  2. Standards are not imported in database');
    console.log('  3. API endpoint path is incorrect');
  });

console.log('\nNext steps:');
console.log('  1. Run: docker-compose exec app node scripts/check-database-state.js');
console.log('  2. If no standards in DB, run: docker-compose exec app npm run migration:up');
console.log('  3. Check frontend API configuration matches backend URL');

