import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function addColumn() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'platform_cms',
    ssl: process.env.DB_SSL === 'true',
  });

  try {
    console.log('\n🔧 Adding ui_config column to visual_modules table...\n');
    
    await pool.query(`
      ALTER TABLE public.visual_modules 
      ADD COLUMN IF NOT EXISTS ui_config TEXT NOT NULL DEFAULT '{"createFormType":"page","editFormType":"page"}';
    `);
    
    console.log('✅ Column added successfully!\n');
    
    // Verify
    const check = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'visual_modules'
      AND column_name = 'ui_config';
    `);
    
    if (check.rows.length > 0) {
      console.log('✅ Verified: ui_config column now exists\n');
      
      // Test query
      console.log('🧪 Testing query...');
      const test = await pool.query(`
        SELECT id, module_name, ui_config 
        FROM public.visual_modules 
        LIMIT 1;
      `);
      
      console.log(`✅ Query successful! Rows: ${test.rows.length}\n`);
      
      console.log('🎉 Done! Restart your backend server now.');
    } else {
      console.log('❌ Failed to add column');
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addColumn();
