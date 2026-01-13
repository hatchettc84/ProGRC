const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Create .env file with the keys
const envContent = `
# JWT Signing Keys
ACCESS_TOKEN_SIGNATURE_PRIVATE="${privateKey.replace(/\n/g, '\\n')}"
ACCESS_TOKEN_SIGNATURE_PUBLIC="${publicKey.replace(/\n/g, '\\n')}"
REFRESH_TOKEN_SIGNATURE="${crypto.randomBytes(64).toString('hex')}"
`;

// Write to .env file
fs.writeFileSync(path.join(__dirname, '../.env'), envContent, { flag: 'a' });

console.log('JWT keys generated and added to .env file'); 