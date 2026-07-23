import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
dotenv.config();

async function runMigration(migrationFile: string) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  try {
    console.log(`\n🔄 Running migration: ${migrationFile}`);
    
    // Read migration SQL file
    const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('📝 SQL:');
    console.log(sql);
    console.log('');
    
    // Execute migration
    await pool.query(sql);
    
    console.log(`✅ Migration completed: ${migrationFile}\n`);
  } catch (error: any) {
    console.error(`❌ Migration failed: ${error.message}`);
    throw error;
  } finally {
    await pool.end();
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Usage: npm run migration:run <migration-file.sql>');
  console.error('   Example: npm run migration:run add-ui-config-to-visual-modules.sql');
  process.exit(1);
}

runMigration(migrationFile).catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
