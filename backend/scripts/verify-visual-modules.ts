import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function verifyTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('\n🔍 Verifying visual_modules table structure...\n');
    
    // Check columns
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        column_default,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'visual_modules'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Columns in visual_modules table:');
    console.table(result.rows);
    
    // Check if ui_config exists
    const hasUiConfig = result.rows.some(row => row.column_name === 'ui_config');
    
    if (hasUiConfig) {
      console.log('\n✅ SUCCESS: ui_config column exists!');
      
      // Test insert
      console.log('\n🧪 Testing insert...');
      await pool.query(`
        INSERT INTO public.visual_modules (
          module_name, 
          display_name, 
          ui_config
        ) VALUES (
          'test_module_' || floor(random() * 1000000),
          'Test Module',
          '{"createFormType":"modal","editFormType":"page"}'
        ) RETURNING id, module_name, ui_config;
      `);
      
      console.log('✅ Insert test successful!');
      
      // Test select
      console.log('\n🧪 Testing select...');
      const selectResult = await pool.query(`
        SELECT id, module_name, display_name, ui_config 
        FROM public.visual_modules 
        WHERE deleted_at IS NULL
        ORDER BY id DESC 
        LIMIT 5;
      `);
      
      console.log('\n📊 Sample data:');
      console.table(selectResult.rows);
      
      console.log('\n✅ All tests passed! Table is ready to use.');
    } else {
      console.log('\n❌ ERROR: ui_config column NOT found!');
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyTables();
