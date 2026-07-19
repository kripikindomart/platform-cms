const bcrypt = require('bcrypt');

async function generate() {
  const password = 'Admin123456';
  const hash = await bcrypt.hash(password, 12);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Test verification
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification:', isValid);
}

generate();
