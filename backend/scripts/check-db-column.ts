import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkColumn() {
  // Use exact same connection as backend
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'platform_cms',
    ssl: process.env.DB_SSL === 'true',
  });

  try {
    console.log('\n🔍 Checking database connection...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}\n`);
    
    // Check current database
    const dbCheck = await pool.query('SELECT current_database()');
    console.log(`✅ Connected to database: ${dbCheck.rows[0].current_database}\n`);
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'visual_modules'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table visual_modules does NOT exist in this database!');
      console.log('\nAvailable tables in public schema:');
      const tables = await pool.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename;
      `);
      console.table(tables.rows);
      process.exit(1);
    }
    
    console.log('✅ Table visual_modules exists\n');
    
    // Check columns
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'visual_modules'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columns in visual_modules:');
    const columns = columnCheck.rows.map(r => r.column_name);
    console.log(columns.join(', '));
    console.log('');
    
    const hasUiConfig = columns.includes('ui_config');
    
    if (hasUiConfig) {
      console.log('✅ Column ui_config EXISTS!\n');
      
      // Try the exact query that backend is running
      console.log('🧪 Testing exact backend query...');
      const testQuery = await pool.query(`
        SELECT "id", "module_name", "display_name", "description", 
               "is_tenant_isolated", "has_soft_delete", "has_audit", "status", 
               "searchable_fields", "filterable_fields", "sortable_fields", 
               "fields_count", "install_count", "ui_config", 
               "created_at", "created_by", "updated_at", "updated_by", 
               "deleted_at", "deleted_by" 
        FROM "visual_modules" 
        WHERE "visual_modules"."deleted_at" IS NULL 
        ORDER BY "visual_modules"."created_at" DESC 
        LIMIT 10
      `);
      
      console.log(`✅ Query successful! Found ${testQuery.rows.length} rows\n`);
      
      if (testQuery.rows.length > 0) {
        console.log('Sample row:');
        console.log(testQuery.rows[0]);
      }
      
    } else {
      console.log('❌ Column ui_config does NOT exist!');
      console.log('\n🔧 Run this to add the column:');
      console.log(`ALTER TABLE public.visual_modules ADD COLUMN ui_config TEXT NOT NULL DEFAULT '{"createFormType":"page","editFormType":"page"}';`);
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkColumn();
