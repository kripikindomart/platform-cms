const bcrypt = require('bcrypt');

const password = process.argv[2] || 'admin123';
const rounds = 12;

bcrypt.hash(password, rounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('\n=================================');
  console.log('Password Hash Generator');
  console.log('=================================');
  console.log('Password:', password);
  console.log('Rounds:', rounds);
  console.log('Hash:', hash);
  console.log('=================================\n');
  
  console.log('SQL to update user:');
  console.log(`UPDATE tenant_demo_company.users SET password_hash = '${hash}' WHERE email = 'admin@platform.com';`);
  console.log('\n');
});
