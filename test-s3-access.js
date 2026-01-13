const { S3Client, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

// Test S3 access
async function testS3Access() {
  const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION || 'us-west-2',
  });
  
  const bucketName = process.env.FRONTEND_S3_BUCKET || 'kovr-app-frontend-dev';
  const basePath = process.env.FRONTEND_S3_BASE_PATH || 'build_assets';
  
  console.log('Testing S3 access...');
  console.log(`Bucket: ${bucketName}`);
  console.log(`Base Path: ${basePath}`);
  console.log(`Region: ${process.env.AWS_S3_REGION || 'us-west-2'}`);
  console.log('');

  try {
    // Test 1: List objects in the base path
    console.log('1. Listing objects in base path...');
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: basePath,
      MaxKeys: 10,
    });
    
    const listResponse = await s3Client.send(listCommand);
    console.log('Objects found:');
    listResponse.Contents?.forEach(obj => {
      console.log(`  - ${obj.Key}`);
    });
    console.log('');

    // Test 2: Check if index.html exists
    console.log('2. Checking if index.html exists...');
    const indexKey = `${basePath}/index.html`;
    try {
      const headCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: indexKey,
      });
      await s3Client.send(headCommand);
      console.log(`✅ index.html exists at: ${indexKey}`);
    } catch (error) {
      console.log(`❌ index.html not found at: ${indexKey}`);
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 3: Check if assets directory exists
    console.log('3. Checking if assets directory exists...');
    const assetsListCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${basePath}/assets/`,
      MaxKeys: 5,
    });
    
    const assetsResponse = await s3Client.send(assetsListCommand);
    console.log('Assets found:');
    assetsResponse.Contents?.forEach(obj => {
      console.log(`  - ${obj.Key}`);
    });
    console.log('');

    // Test 4: Try to get a specific JS file
    console.log('4. Testing specific file access...');
    const testPath = 'assets/index-BKIlqdLj.js';
    const cleanPath = testPath.startsWith('/') ? testPath.slice(1) : testPath;
    const key = cleanPath.startsWith(basePath) ? cleanPath : `${basePath}/${cleanPath}`;
    
    console.log(`Request path: ${testPath}`);
    console.log(`Clean path: ${cleanPath}`);
    console.log(`S3 key: ${key}`);
    
    try {
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      
      const response = await s3Client.send(getCommand);
      console.log(`✅ File found! Content-Type: ${response.ContentType}, Size: ${response.ContentLength} bytes`);
    } catch (error) {
      console.log(`❌ File not found: ${error.message}`);
      
      // Try alternative paths
      console.log('Trying alternative paths...');
      const alternatives = [
        `${basePath}/${testPath}`,
        `${testPath}`,
        `assets/${testPath.split('/').pop()}`,
      ];
      
      for (const altKey of alternatives) {
        try {
          const altCommand = new GetObjectCommand({
            Bucket: bucketName,
            Key: altKey,
          });
          const altResponse = await s3Client.send(altCommand);
          console.log(`✅ Found at alternative path: ${altKey}`);
          break;
        } catch (altError) {
          console.log(`❌ Not found at: ${altKey}`);
        }
      }
    }

  } catch (error) {
    console.error('Error testing S3 access:', error);
  }
}

// Run the test
testS3Access().catch(console.error); 