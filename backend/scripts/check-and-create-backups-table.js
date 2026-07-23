/**
 * Check and create tenant_schema_backups table
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load .env file manually
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    env[key] = value;
  }
});

async function main() {
  // Build connection config from env
  const config = {
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT) || 5432,
    database: env.DB_NAME || 'platform_cms',
    user: env.DB_USER || 'postgres',
    password: env.DB_PASSWORD || 'postgres',
  };

  console.log('Database config:', {
    ...config,
    password: '****'
  });

  const client = new Client(config);

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Check if table exists
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'tenant_schema_backups'
      );
    `);

    const exists = checkResult.rows[0].exists;
    console.log('Table exists:', exists);

    if (!exists) {
      console.log('Creating table...');

      // Read and execute migration
      const migrationPath = path.join(__dirname, '../migrations/create-tenant-schema-backups-table-no-fk.sql');
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      await client.query(sql);
      
      console.log('✅ Table created successfully!');
    } else {
      console.log('✅ Table already exists');
    }

    // Show table structure
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'tenant_schema_backups'
      ORDER BY ordinal_position;
    `);

    console.log('\nTable structure:');
    console.table(columnsResult.rows);

    // Count rows
    const countResult = await client.query('SELECT COUNT(*) as count FROM tenant_schema_backups');
    console.log('\nRows in table:', countResult.rows[0].count);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
