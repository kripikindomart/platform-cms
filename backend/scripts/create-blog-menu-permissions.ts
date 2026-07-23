import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

async function createMenuAndPermissions() {
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
    console.log('\n📋 Creating menu & permissions for blog module...\n');
    
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
      
      // Create permissions
      try {
        const permissions = [
          { action: 'view_blog', resource: 'blog', description: 'View blog records' },
          { action: 'create_blog', resource: 'blog', description: 'Create new blog records' },
          { action: 'update_blog', resource: 'blog', description: 'Update blog records' },
          { action: 'delete_blog', resource: 'blog', description: 'Delete blog records' },
        ];
        
        let createdCount = 0;
        for (const perm of permissions) {
          const permResult = await db.execute(sql.raw(`
            INSERT INTO ${schema}.permissions (action, resource, description, created_at)
            VALUES ('${perm.action}', '${perm.resource}', '${perm.description}', NOW())
            ON CONFLICT (action) DO NOTHING
            RETURNING id
          `));
          
          if (permResult.rows.length > 0) {
            createdCount++;
          }
        }
        
        console.log(`  ✓ Created ${createdCount} permission(s)`);
      } catch (error: any) {
        console.log(`  ⚠ Could not create permissions: ${error.message}`);
      }
      
      // Create menu item
      try {
        // Get or create "Main Menu"
        const menuResult = await db.execute(sql.raw(`
          INSERT INTO ${schema}.menus (name, slug, icon, "order", is_active, created_at, updated_at)
          VALUES ('Main Menu', 'main-menu', 'LayoutDashboard', 0, true, NOW(), NOW())
          ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
          RETURNING id
        `));
        
        const mainMenuId = (menuResult.rows[0] as any).id;
        
        // Insert blog menu item
        const menuItemResult = await db.execute(sql.raw(`
          INSERT INTO ${schema}.menu_items (
            menu_id, 
            module_name, 
            label, 
            url, 
            icon, 
            "order", 
            is_active,
            required_permission,
            created_at, 
            updated_at
          )
          VALUES (
            ${mainMenuId},
            'blog',
            'Blog',
            '/portal/blog',
            'FileText',
            999,
            true,
            'view_blog',
            NOW(),
            NOW()
          )
          ON CONFLICT (menu_id, module_name) DO UPDATE 
          SET label = 'Blog', updated_at = NOW()
          RETURNING id
        `));
        
        if (menuItemResult.rows.length > 0) {
          console.log(`  ✓ Created menu item 'Blog'`);
        }
      } catch (error: any) {
        console.log(`  ⚠ Could not create menu item: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('✅ Menu & permissions created!\n');
    console.log('💡 Now refresh your browser to see the Blog menu.\n');
    
  } catch (error: any) {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createMenuAndPermissions();
