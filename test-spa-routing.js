const http = require('http');

// Test URLs to verify SPA routing
const testUrls = [
  '/',
  '/dashboard',
  '/users/123',
  '/settings/profile',
  '/assets/main.js',
  '/static/styles.css',
  '/api/v1/users',
  '/health/frontend',
  '/favicon.ico',
  '/manifest.json'
];

function testUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 80, // Frontend port
      path: url,
      method: 'GET',
      headers: {
        'User-Agent': 'Test-SPA-Routing'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          url,
          statusCode: res.statusCode,
          contentType: res.headers['content-type'],
          contentLength: data.length
        });
      });
    });

    req.on('error', (err) => {
      reject({ url, error: err.message });
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject({ url, error: 'Request timeout' });
    });

    req.end();
  });
}

async function runTests() {
  console.log('Testing SPA Routing Setup...\n');
  
  for (const url of testUrls) {
    try {
      const result = await testUrl(url);
      console.log(`✅ ${url} -> Status: ${result.statusCode}, Content-Type: ${result.contentType}`);
    } catch (error) {
      console.log(`❌ ${url} -> Error: ${error.error}`);
    }
  }
  
  console.log('\nTest completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testUrl, runTests }; 