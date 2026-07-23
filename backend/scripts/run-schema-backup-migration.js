/**
 * Run tenant_schema_backups migration
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✓ Connected to database');

    // Read migration SQL
    const migrationPath = path.join(__dirname, '../migrations/create-tenant-schema-backups-table-no-fk.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration: create-tenant-schema-backups-table-no-fk.sql');

    // Execute migration
    await client.query(sql);

    console.log('✅ Migration completed successfully!');
    console.log('Table "tenant_schema_backups" has been created with indexes and comments.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
