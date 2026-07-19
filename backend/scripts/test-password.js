const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function testPassword() {
  // Connect to database
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'platform_cms',
    user: 'postgres',
    password: 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get user from database
    const result = await client.query(
      "SELECT email, password_hash FROM tenant_demo_company.users WHERE email = 'admin@platform.com'"
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found!');
      return;
    }

    const user = result.rows[0];
    console.log('\n📧 Email:', user.email);
    console.log('🔒 Stored hash:', user.password_hash);
    console.log('📏 Hash length:', user.password_hash.length);

    // Test password
    const testPassword = 'admin123';
    console.log('\n🔑 Testing password:', testPassword);

    const isValid = await bcrypt.compare(testPassword, user.password_hash);
    console.log('\n✅ Password valid:', isValid);

    if (!isValid) {
      console.log('\n❌ PASSWORD MISMATCH!');
      console.log('Generating new hash for:', testPassword);
      
      const newHash = await bcrypt.hash(testPassword, 12);
      console.log('New hash:', newHash);
      console.log('\nSQL to update:');
      console.log(`UPDATE tenant_demo_company.users SET password_hash = '${newHash}' WHERE email = 'admin@platform.com';`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

testPassword();
