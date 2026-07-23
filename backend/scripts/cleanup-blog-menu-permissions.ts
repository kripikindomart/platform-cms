import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'platform_cms',
    ssl: process.env.DB_SSL === 'true',
  });

  const db = drizzle(pool);

  try {
    console.log('\n🧹 Cleaning up blog module menu & permissions...\n');
    
    // Get all tenant schemas
    const result = await db.execute(sql`
      SELECT slug 
      FROM public.tenants 
      WHERE deleted_at IS NULL
    `);
    
    const tenantSchemas = (result.rows as any[]).map((row: any) => `tenant_${row.slug}`);
    
    console.log(`Found ${tenantSchemas.length} tenant(s): ${tenantSchemas.join(', ')}\n`);
    
    for (const schema of tenantSchemas) {
      console.log(`📂 Processing ${schema}...`);
      
      // Delete blog menus
      try {
        const menuResult = await db.execute(sql.raw(`
          DELETE FROM ${schema}.menu_items 
          WHERE module_name = 'blog'
          OR url = '/portal/blog' 
          OR url LIKE '/portal/blog/%'
          RETURNING id, label, url
        `));
        
        if (menuResult.rows.length > 0) {
          console.log(`  ✓ Deleted ${menuResult.rows.length} menu item(s):`);
          menuResult.rows.forEach((row: any) => {
            console.log(`    - ${row.label} (${row.url})`);
          });
        } else {
          console.log(`  ℹ No blog menu items found`);
        }
      } catch (error: any) {
        console.log(`  ⚠ Could not delete menus: ${error.message}`);
      }
      
      // Delete blog permissions
      try {
        const permissions = ['view_blog', 'create_blog', 'update_blog', 'delete_blog'];
        let totalDeleted = 0;
        
        for (const permission of permissions) {
          const permResult = await db.execute(sql.raw(`
            DELETE FROM ${schema}.permissions 
            WHERE action = '${permission}'
            RETURNING id, action, resource
          `));
          totalDeleted += permResult.rows.length;
        }
        
        if (totalDeleted > 0) {
          console.log(`  ✓ Deleted ${totalDeleted} permission(s)`);
        } else {
          console.log(`  ℹ No blog permissions found`);
        }
      } catch (error: any) {
        console.log(`  ⚠ Could not delete permissions: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('✅ Cleanup completed!\n');
    console.log('💡 Now restart your backend server and refresh the browser.\n');
    
  } catch (error: any) {
    console.error('\n❌ Cleanup failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanup();
