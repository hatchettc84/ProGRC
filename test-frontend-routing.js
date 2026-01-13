// Test script to verify frontend routing logic
const FrontendService = require('./src/frontend/frontend.service').FrontendService;

// Mock the service for testing
class MockFrontendService {
  isStaticAsset(path) {
    const staticExtensions = [
      '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', 
      '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.txt', '.xml', '.webp', '.avif', '.gz',
    ];
    
    return staticExtensions.some(ext => path.toLowerCase().endsWith(ext));
  }
}

const service = new MockFrontendService();

// Test cases
const testPaths = [
  '/',
  '/health/frontend',
  '/dashboard',
  '/users/123',
  '/static/css/main.css',
  '/static/js/app.js',
  '/images/logo.png',
  '/api/v1/users',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
  '/static/fonts/roboto.woff2',
  '/assets/images/banner.jpg',
];

console.log('Testing frontend routing logic:');
console.log('================================');

testPaths.forEach(path => {
  const isStatic = service.isStaticAsset(path);
  const isApi = path.startsWith('/api/');
  const isHealth = path === '/health/frontend';
  const isRoot = path === '/';
  
  let routeType = 'SPA Route';
  if (isStatic) routeType = 'Static Asset';
  if (isApi) routeType = 'API Route';
  if (isHealth) routeType = 'Health Check';
  if (isRoot) routeType = 'Root Path';
  
  console.log(`${path.padEnd(25)} → ${routeType}`);
});

console.log('\nExpected behavior:');
console.log('- Root path (/) should serve index.html');
console.log('- Health check (/health/frontend) should be handled by specific route');
console.log('- Static assets should be served directly from S3');
console.log('- SPA routes should serve index.html');
console.log('- API routes should return 404 if not found'); 