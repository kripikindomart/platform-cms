const bcrypt = require('bcrypt');

async function test() {
  const password = 'Admin123456';
  
  // Get hash from DB - PUBLIC SCHEMA
  const { Client } = require('pg');
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'platform_cms',
    user: 'postgres',
    password: 'postgres',
  });

  await client.connect();
  
  const result = await client.query(
    "SELECT password_hash FROM public.users WHERE email = 'admin@platform.com'"
  );
  
  if (result.rows.length === 0) {
    console.log('User not found in public schema');
    await client.end();
    return;
  }
  
  const hash = result.rows[0].password_hash;
  console.log('Hash from DB:', hash);
  console.log('Password to test:', password);
  
  const isValid = await bcrypt.compare(password, hash);
  console.log('Password valid:', isValid);
  
  await client.end();
}

test().catch(console.error);
