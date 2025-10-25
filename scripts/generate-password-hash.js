// Utility to generate bcrypt password hashes for admin users
// Run this with: node scripts/generate-password-hash.js

const bcrypt = require('bcryptjs');

// Configuration
const SALT_ROUNDS = 10;

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('\n❌ Error: Password is required');
  console.log('\nUsage: node scripts/generate-password-hash.js <password>');
  console.log('Example: node scripts/generate-password-hash.js mySecurePassword123\n');
  process.exit(1);
}

// Generate hash
console.log('\n🔐 Generating password hash...\n');

bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
  if (err) {
    console.error('❌ Error generating hash:', err);
    process.exit(1);
  }

  console.log('✅ Password hash generated successfully!\n');
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\n📋 SQL Insert Statement:');
  console.log('--------------------------------------------------');
  console.log(`INSERT INTO admin_users (username, password_hash, full_name, email)`);
  console.log(`VALUES (`);
  console.log(`  'your_username',`);
  console.log(`  '${hash}',`);
  console.log(`  'Full Name',`);
  console.log(`  'email@example.com'`);
  console.log(`);`);
  console.log('--------------------------------------------------\n');
});
