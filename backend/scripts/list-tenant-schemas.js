/**
 * List all tenant schemas and their status
 * Shows which schemas are active, backed up, or orphaned
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

  const client = new Client(config);

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Get all tenant_* schemas with their sizes
    const schemasResult = await client.query(`
      SELECT 
        schema_name,
        pg_size_pretty(
          sum(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)))::bigint
        ) as size,
        COUNT(tablename) as table_count
      FROM pg_tables
      WHERE schemaname LIKE 'tenant_%'
      GROUP BY schema_name
      ORDER BY schema_name;
    `);

    const allSchemas = schemasResult.rows;

    // Get tenant info
    const tenantsResult = await client.query(`
      SELECT 
        id,
        name,
        schema_name,
        deleted_at IS NOT NULL as is_deleted
      FROM tenants 
      WHERE schema_name IS NOT NULL;
    `);

    const tenantMap = new Map();
    tenantsResult.rows.forEach(t => {
      tenantMap.set(t.schema_name, {
        id: t.id,
        name: t.name,
        status: t.is_deleted ? 'SOFT_DELETED' : 'ACTIVE'
      });
    });

    // Get backup info
    const backupsResult = await client.query(`
      SELECT 
        schema_name,
        tenant_name,
        expires_at,
        deleted_at IS NOT NULL as is_deleted
      FROM tenant_schema_backups;
    `);

    const backupMap = new Map();
    backupsResult.rows.forEach(b => {
      backupMap.set(b.schema_name, {
        tenant_name: b.tenant_name,
        expires_at: b.expires_at,
        status: b.is_deleted ? 'BACKUP_DELETED' : 'BACKUP_ACTIVE'
      });
    });

    console.log('='.repeat(100));
    console.log('TENANT SCHEMAS STATUS');
    console.log('='.repeat(100));
    console.log(
      'Schema Name'.padEnd(35),
      'Status'.padEnd(15),
      'Tenant/Backup'.padEnd(25),
      'Size'.padEnd(12),
      'Tables'
    );
    console.log('-'.repeat(100));

    allSchemas.forEach(schema => {
      const tenant = tenantMap.get(schema.schema_name);
      const backup = backupMap.get(schema.schema_name);

      let status = 'ORPHANED';
      let info = '-';

      if (tenant) {
        status = tenant.status;
        info = `${tenant.name} (ID: ${tenant.id})`;
      } else if (backup) {
        status = backup.status;
        info = `${backup.tenant_name} (Backup)`;
      }

      const statusColor = status === 'ORPHANED' ? '🔴' : 
                         status === 'ACTIVE' ? '🟢' : 
                         status === 'BACKUP_ACTIVE' ? '🟡' : '⚪';

      console.log(
        schema.schema_name.padEnd(35),
        `${statusColor} ${status}`.padEnd(15),
        info.substring(0, 25).padEnd(25),
        (schema.size || 'N/A').padEnd(12),
        schema.table_count
      );
    });

    console.log('-'.repeat(100));
    console.log(`\nTotal schemas: ${allSchemas.length}`);
    console.log(`  Active: ${Array.from(tenantMap.values()).filter(t => t.status === 'ACTIVE').length}`);
    console.log(`  Soft Deleted: ${Array.from(tenantMap.values()).filter(t => t.status === 'SOFT_DELETED').length}`);
    console.log(`  Backup Active: ${Array.from(backupMap.values()).filter(b => b.status === 'BACKUP_ACTIVE').length}`);
    console.log(`  Orphaned: ${allSchemas.filter(s => !tenantMap.has(s.schema_name) && !backupMap.has(s.schema_name)).length}`);
    console.log('');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
