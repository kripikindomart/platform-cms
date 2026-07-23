/**
 * Add Missing Tables to Simonev Tenant
 * Adds menus, menu_items, and upload_settings tables to existing tenant
 */

require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { sql } = require('drizzle-orm');

async function addMissingTables() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'platform_cms',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  const db = drizzle(pool);
  const schemaName = 'tenant_wbuei1hsx5icgqya9apkgl84k2'; // Simonev

  try {
    console.log(`[OK] Adding missing tables to ${schemaName}...\n`);

    // Set search path
    await db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

    // Create menus table
    console.log('Creating menus table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS menus (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50),
        "order" INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
        updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
        deleted_at TIMESTAMP WITH TIME ZONE,
        deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
      )
    `);

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_menus_slug ON menus(slug)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_menus_order ON menus("order")
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_menus_deleted_at ON menus(deleted_at)
    `);
    console.log('[OK] menus table created\n');

    // Create menu_items table
    console.log('Creating menu_items table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS menu_items (
        id BIGSERIAL PRIMARY KEY,
        menu_id BIGINT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
        parent_id BIGINT REFERENCES menu_items(id) ON DELETE CASCADE,
        module_name VARCHAR(100) NOT NULL,
        label VARCHAR(100) NOT NULL,
        url VARCHAR(255) NOT NULL,
        icon VARCHAR(50),
        "order" INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT true,
        required_permission VARCHAR(100),
        metadata TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
        updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
        deleted_at TIMESTAMP WITH TIME ZONE,
        deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
      )
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id ON menu_items(menu_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON menu_items(parent_id)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_menu_items_order ON menu_items("order")
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_menu_items_deleted_at ON menu_items(deleted_at)
    `);
    console.log('[OK] menu_items table created\n');

    // Create upload_settings table
    console.log('Creating upload_settings table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS upload_settings (
        id BIGSERIAL PRIMARY KEY,
        category VARCHAR(50) NOT NULL UNIQUE,
        url_format VARCHAR(100) NOT NULL,
        thumbnail_size INTEGER,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
        updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
        deleted_at TIMESTAMP WITH TIME ZONE,
        deleted_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
      )
    `);

    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_upload_settings_category ON upload_settings(category)
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_upload_settings_is_active ON upload_settings(is_active)
    `);
    console.log('[OK] upload_settings table created\n');

    // Seed main menu
    console.log('Seeding main menu...');
    let mainMenuResult = await db.execute(sql`
      INSERT INTO menus (name, slug, icon, "order", is_active, created_at, updated_at)
      VALUES ('Main Menu', 'main-menu', 'LayoutDashboard', 1, true, NOW(), NOW())
      ON CONFLICT (slug) DO NOTHING
      RETURNING id
    `);
    
    let mainMenu = mainMenuResult.rows?.[0] || mainMenuResult[0];
    
    // If menu already existed, fetch it
    if (!mainMenu) {
      const existingMenuResult = await db.execute(sql`
        SELECT id FROM menus WHERE slug = 'main-menu' LIMIT 1
      `);
      mainMenu = existingMenuResult.rows?.[0] || existingMenuResult[0];
    }
    
    console.log(`[OK] Main menu id: ${mainMenu.id}\n`);

    // Seed upload_settings menu item
    console.log('Seeding upload_settings menu item...');
    await db.execute(sql`
      INSERT INTO menu_items 
      (menu_id, module_name, label, url, icon, required_permission, "order", is_active, created_at, updated_at)
      VALUES (
        ${mainMenu.id}, 
        'upload-settings', 
        'Upload Settings', 
        '/portal/upload-settings', 
        'Settings', 
        'upload-settings.read.tenant', 
        1, 
        true, 
        NOW(), 
        NOW()
      )
    `);
    console.log('[OK] Upload Settings menu item created\n');

    // Seed default upload_settings
    console.log('Seeding default upload_settings...');
    const defaultSettings = [
      { category: 'image', url_format: 'direct_view', thumbnail_size: 300 },
      { category: 'document', url_format: 'download', thumbnail_size: null },
      { category: 'video', url_format: 'embed_view', thumbnail_size: null },
      { category: 'audio', url_format: 'download', thumbnail_size: null },
      { category: 'other', url_format: 'download', thumbnail_size: null },
    ];

    for (const setting of defaultSettings) {
      await db.execute(sql`
        INSERT INTO upload_settings (category, url_format, thumbnail_size, is_active, created_at, updated_at)
        VALUES (${setting.category}, ${setting.url_format}, ${setting.thumbnail_size}, true, NOW(), NOW())
        ON CONFLICT (category) DO NOTHING
      `);
      console.log(`  [OK] ${setting.category} setting created`);
    }

    // Seed upload_settings permissions if they don't exist
    console.log('\nSeeding upload_settings permissions...');
    const permissions = [
      {
        resource: 'upload-settings',
        action: 'read',
        scope: 'tenant',
        description: 'Permission to view and list upload-settings',
      },
      {
        resource: 'upload-settings',
        action: 'create',
        scope: 'tenant',
        description: 'Permission to create new upload-settings',
      },
      {
        resource: 'upload-settings',
        action: 'update',
        scope: 'tenant',
        description: 'Permission to update existing upload-settings',
      },
      {
        resource: 'upload-settings',
        action: 'delete',
        scope: 'tenant',
        description: 'Permission to delete upload-settings',
      },
    ];

    for (const perm of permissions) {
      await db.execute(sql`
        INSERT INTO permissions (resource, action, scope, description, created_at)
        VALUES (${perm.resource}, ${perm.action}, ${perm.scope}, ${perm.description}, NOW())
        ON CONFLICT (resource, action, scope) DO NOTHING
      `);
      console.log(`  [OK] ${perm.resource}.${perm.action}.${perm.scope}`);
    }

    // Assign permissions to admin role
    console.log('\nAssigning permissions to admin role...');
    const adminRoleResult = await db.execute(sql`
      SELECT id FROM roles WHERE name = 'admin' OR name = 'Administrator' LIMIT 1
    `);
    const adminRole = adminRoleResult.rows?.[0] || adminRoleResult[0];

    if (adminRole) {
      for (const perm of permissions) {
        const permResult = await db.execute(sql`
          SELECT id FROM permissions 
          WHERE resource = ${perm.resource} 
          AND action = ${perm.action} 
          AND scope = ${perm.scope}
        `);
        const permission = permResult.rows?.[0] || permResult[0];

        if (permission) {
          await db.execute(sql`
            INSERT INTO role_permissions (role_id, permission_id, assigned_at)
            VALUES (${adminRole.id}, ${permission.id}, NOW())
            ON CONFLICT (role_id, permission_id) DO NOTHING
          `);
          console.log(`  [OK] ${perm.resource}.${perm.action}.${perm.scope} -> Admin`);
        }
      }
    }

    // Reset search path
    await db.execute(sql.raw(`RESET search_path`));

    console.log('\n[SUCCESS] All missing tables added successfully!\n');
  } catch (error) {
    console.error('[ERROR] Failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run script
addMissingTables()
  .then(() => {
    console.log('[DONE] Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[FAIL] Script failed:', error);
    process.exit(1);
  });
