const bcrypt = require('bcrypt');

async function generateHash() {
  const hash = await bcrypt.hash('admin', 10);
  console.log('Password hash for "admin":', hash);
  console.log('\nUse this in the migration file.');
}

generateHash().catch(console.error);

