/**
 * Cleanup orphaned tenant schemas
 * Find and drop schemas that don't have corresponding tenant records
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
    console.log('Connected to database\n');

    // 1. Get all tenant_* schemas
    const schemasResult = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name;
    `);

    const allSchemas = schemasResult.rows.map(r => r.schema_name);
    console.log(`Found ${allSchemas.length} tenant schemas in database`);

    if (allSchemas.length === 0) {
      console.log('No tenant schemas found. Nothing to cleanup.');
      return;
    }

    // 2. Get all schema_name from tenants table (including deleted)
    const tenantsResult = await client.query(`
      SELECT schema_name FROM tenants WHERE schema_name IS NOT NULL;
    `);

    const tenantSchemas = new Set(tenantsResult.rows.map(r => r.schema_name));
    console.log(`Found ${tenantSchemas.size} schemas in tenants table`);

    // 3. Get all schema_name from tenant_schema_backups (including deleted backups)
    const backupsResult = await client.query(`
      SELECT schema_name FROM tenant_schema_backups WHERE deleted_at IS NULL;
    `);

    const backupSchemas = new Set(backupsResult.rows.map(r => r.schema_name));
    console.log(`Found ${backupSchemas.size} schemas in backups table\n`);

    // 4. Find orphaned schemas
    const orphanedSchemas = allSchemas.filter(schema => 
      !tenantSchemas.has(schema) && !backupSchemas.has(schema)
    );

    if (orphanedSchemas.length === 0) {
      console.log('No orphaned schemas found. All schemas are accounted for!');
      return;
    }

    console.log(`Found ${orphanedSchemas.length} ORPHANED schemas:`);
    orphanedSchemas.forEach(schema => {
      console.log(`  - ${schema}`);
    });

    console.log('\nThese schemas will be DROPPED (deleted permanently).');
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 5. Drop orphaned schemas
    let droppedCount = 0;
    let failedCount = 0;

    for (const schema of orphanedSchemas) {
      try {
        console.log(`Dropping schema: ${schema}...`);
        await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE;`);
        droppedCount++;
        console.log(`  SUCCESS`);
      } catch (error) {
        failedCount++;
        console.log(`  FAILED: ${error.message}`);
      }
    }

    console.log(`\n==============================`);
    console.log(`Cleanup Summary:`);
    console.log(`  Total orphaned: ${orphanedSchemas.length}`);
    console.log(`  Successfully dropped: ${droppedCount}`);
    console.log(`  Failed: ${failedCount}`);
    console.log(`==============================\n`);

  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
