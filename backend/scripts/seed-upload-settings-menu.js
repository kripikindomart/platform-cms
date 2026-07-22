/**
 * Seed Upload Settings Menu & Permissions
 * Applies menu items and permissions to all tenant schemas
 */

require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { sql } = require('drizzle-orm');

async function seedMenuAndPermissions() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'platform_cms',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  const db = drizzle(pool);

  try {
    console.log('[OK] Starting upload-settings menu & permissions seeding...\n');

    // Get all tenant schemas
    const result = await db.execute(sql`
      SELECT id, name, slug, schema_name 
      FROM public.tenants 
      WHERE deleted_at IS NULL
      ORDER BY id
    `);

    const tenants = result.rows || result;
    console.log(`Found ${tenants.length} active tenant(s)\n`);

    for (const tenant of tenants) {
      console.log(`Processing tenant: ${tenant.name} (${tenant.schema_name})`);

      // 1. Insert permissions
      console.log('  [1/3] Seeding permissions...');
      
      const permissions = [
        { resource: 'upload-settings', action: 'read', scope: 'tenant', description: 'Permission to view and list upload-settings' },
        { resource: 'upload-settings', action: 'create', scope: 'tenant', description: 'Permission to create new upload-settings' },
        { resource: 'upload-settings', action: 'update', scope: 'tenant', description: 'Permission to update existing upload-settings' },
        { resource: 'upload-settings', action: 'delete', scope: 'tenant', description: 'Permission to delete upload-settings' },
      ];

      for (const perm of permissions) {
        // Check if permission exists
        const existCheck = await db.execute(sql`
          SELECT id FROM ${sql.identifier(tenant.schema_name)}.permissions
          WHERE resource = ${perm.resource}
          AND action = ${perm.action}
          AND scope = ${perm.scope}
        `);
        const existing = existCheck.rows || existCheck;

        if (existing.length === 0) {
          await db.execute(sql`
            INSERT INTO ${sql.identifier(tenant.schema_name)}.permissions
            (resource, action, scope, description, created_at)
            VALUES (${perm.resource}, ${perm.action}, ${perm.scope}, ${perm.description}, NOW())
          `);
          console.log(`    [OK] ${perm.resource}.${perm.action}.${perm.scope}`);
        } else {
          console.log(`    [EXISTS] ${perm.resource}.${perm.action}.${perm.scope}`);
        }
      }

      // 2. Assign permissions to admin role
      console.log('  [2/3] Assigning permissions to admin role...');
      
      // Get admin role (usually id=1, but let's query to be safe)
      const adminRoleCheck = await db.execute(sql`
        SELECT id FROM ${sql.identifier(tenant.schema_name)}.roles
        WHERE name = 'Admin' OR name = 'Administrator' OR id = 1
        AND deleted_at IS NULL
        ORDER BY id
        LIMIT 1
      `);
      const adminRoleResult = adminRoleCheck.rows || adminRoleCheck;
      
      if (adminRoleResult.length > 0) {
        const adminRoleId = adminRoleResult[0].id;
        
        for (const perm of permissions) {
          // Get permission ID
          const permCheck = await db.execute(sql`
            SELECT id FROM ${sql.identifier(tenant.schema_name)}.permissions
            WHERE resource = ${perm.resource}
            AND action = ${perm.action}
            AND scope = ${perm.scope}
          `);
          const permResult = permCheck.rows || permCheck;
          
          if (permResult.length > 0) {
            const permId = permResult[0].id;
            
            // Check if already assigned
            const assignCheck = await db.execute(sql`
              SELECT id FROM ${sql.identifier(tenant.schema_name)}.role_permissions
              WHERE role_id = ${adminRoleId}
              AND permission_id = ${permId}
            `);
            const assignResult = assignCheck.rows || assignCheck;
            
            if (assignResult.length === 0) {
              await db.execute(sql`
                INSERT INTO ${sql.identifier(tenant.schema_name)}.role_permissions
                (role_id, permission_id)
                VALUES (${adminRoleId}, ${permId})
              `);
              console.log(`    [OK] ${perm.resource}.${perm.action}.${perm.scope} -> Admin role`);
            } else {
              console.log(`    [EXISTS] ${perm.resource}.${perm.action}.${perm.scope} -> Admin role`);
            }
          }
        }
      } else {
        console.log('    [SKIP] Admin role not found');
      }

      // 3. Insert menu items (skip if menus table doesn't exist)
      console.log('  [3/3] Seeding menu items...');
      
      // Check if menus table exists
      const tableCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = ${tenant.schema_name}
          AND table_name = 'menus'
        ) as table_exists
      `);
      const tableCheckResult = tableCheck.rows || tableCheck;
      const menusTableExists = tableCheckResult[0]?.table_exists || false;
      
      if (!menusTableExists) {
        console.log('    [SKIP] Menus table does not exist in this tenant schema');
        console.log('');
        continue;
      }
      
      // Get or create main menu
      const mainMenuCheck = await db.execute(sql`
        SELECT id FROM ${sql.identifier(tenant.schema_name)}.menus
        WHERE slug = 'main-menu'
        AND deleted_at IS NULL
      `);
      let mainMenuResult = mainMenuCheck.rows || mainMenuCheck;
      
      let mainMenuId;
      if (mainMenuResult.length === 0) {
        const insertMenu = await db.execute(sql`
          INSERT INTO ${sql.identifier(tenant.schema_name)}.menus
          (name, slug, icon, "order", is_active, created_at, updated_at)
          VALUES ('Main Menu', 'main-menu', 'LayoutDashboard', 1, true, NOW(), NOW())
          RETURNING id
        `);
        const insertResult = insertMenu.rows || insertMenu;
        mainMenuId = insertResult[0].id;
        console.log('    [OK] Created Main Menu');
      } else {
        mainMenuId = mainMenuResult[0].id;
      }

      // Check if menu item already exists
      const menuItemCheck = await db.execute(sql`
        SELECT id FROM ${sql.identifier(tenant.schema_name)}.menu_items
        WHERE module_name = 'upload-settings'
        AND menu_id = ${mainMenuId}
        AND parent_id IS NULL
        AND deleted_at IS NULL
      `);
      const menuItemResult = menuItemCheck.rows || menuItemCheck;
      
      if (menuItemResult.length === 0) {
        // Get next order
        const orderCheck = await db.execute(sql`
          SELECT COALESCE(MAX("order"), 0) + 1 as next_order
          FROM ${sql.identifier(tenant.schema_name)}.menu_items
          WHERE menu_id = ${mainMenuId}
          AND parent_id IS NULL
          AND deleted_at IS NULL
        `);
        const orderResult = orderCheck.rows || orderCheck;
        const nextOrder = orderResult[0]?.next_order || 1;
        
        // Insert main menu item
        await db.execute(sql`
          INSERT INTO ${sql.identifier(tenant.schema_name)}.menu_items
          (menu_id, parent_id, module_name, label, url, icon, required_permission, "order", is_active, created_at, updated_at)
          VALUES (
            ${mainMenuId},
            NULL,
            'upload-settings',
            'Upload Settings',
            '/portal/upload-settings',
            'Settings',
            'upload-settings.read.tenant',
            ${nextOrder},
            true,
            NOW(),
            NOW()
          )
        `);
        console.log('    [OK] Upload Settings menu item');
      } else {
        console.log('    [EXISTS] Upload Settings menu item');
      }

      console.log('');
    }

    console.log('[SUCCESS] Menu & permissions seeding complete!\n');
  } catch (error) {
    console.error('[ERROR] Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seed
seedMenuAndPermissions()
  .then(() => {
    console.log('[DONE] Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[FAIL] Script failed:', error);
    process.exit(1);
  });
