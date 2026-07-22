/**
 * Check User Permissions
 * Quick script to check what permissions a user has
 */

require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { sql } = require('drizzle-orm');

async function checkUserPermissions() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'platform_cms',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  const db = drizzle(pool);

  try {
    // Get all users
    const usersResult = await db.execute(sql`
      SELECT id, email, name 
      FROM public.users 
      WHERE deleted_at IS NULL 
      ORDER BY id 
      LIMIT 5
    `);
    const users = usersResult.rows || usersResult;

    console.log('\n=== USERS ===');
    users.forEach(u => console.log(`${u.id}: ${u.email} (${u.name})`));

    // Prompt for user ID (for demo, we'll use first user)
    const userId = users[0]?.id;
    if (!userId) {
      console.log('No users found');
      return;
    }

    console.log(`\n=== CHECKING PERMISSIONS FOR USER ID: ${userId} ===\n`);

    // Get all tenants
    const tenantsResult = await db.execute(sql`
      SELECT id, name, slug, schema_name
      FROM public.tenants
      WHERE deleted_at IS NULL
      ORDER BY name
    `);
    const tenants = tenantsResult.rows || tenantsResult;

    for (const tenant of tenants) {
      console.log(`\nTenant: ${tenant.name} (${tenant.schema_name})`);
      console.log('─'.repeat(60));

      // Get user roles in this tenant
      const rolesResult = await db.execute(sql`
        SELECT r.id, r.name, r.display_name
        FROM ${sql.identifier(tenant.schema_name)}.roles r
        INNER JOIN ${sql.identifier(tenant.schema_name)}.user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ${userId}
        AND r.deleted_at IS NULL
      `);
      const roles = rolesResult.rows || rolesResult;

      console.log(`\nRoles (${roles.length}):`);
      roles.forEach(r => console.log(`  - ${r.display_name} (${r.name})`));

      // Get all permissions for these roles
      if (roles.length > 0) {
        const roleIds = roles.map(r => r.id).join(',');
        
        const permsResult = await db.execute(sql.raw(`
          SELECT DISTINCT p.id, p.resource, p.action, p.scope, p.description
          FROM "${tenant.schema_name}".permissions p
          INNER JOIN "${tenant.schema_name}".role_permissions rp ON p.id = rp.permission_id
          WHERE rp.role_id IN (${roleIds})
          ORDER BY p.resource, p.action
        `));
        const permissions = permsResult.rows || permsResult;

        console.log(`\nPermissions (${permissions.length}):`);
        
        // Group by resource
        const grouped = {};
        permissions.forEach(p => {
          if (!grouped[p.resource]) grouped[p.resource] = [];
          grouped[p.resource].push(`${p.action}.${p.scope}`);
        });

        Object.entries(grouped).forEach(([resource, actions]) => {
          console.log(`  ${resource}:`);
          actions.forEach(a => console.log(`    - ${a}`));
        });

        // Check specifically for upload-settings
        const uploadSettingsPerms = permissions.filter(p => p.resource === 'upload-settings');
        if (uploadSettingsPerms.length > 0) {
          console.log('\n✅ User has upload-settings permissions');
        } else {
          console.log('\n❌ User does NOT have upload-settings permissions');
        }
      }
    }

    console.log('\n');
  } catch (error) {
    console.error('[ERROR]', error);
  } finally {
    await pool.end();
  }
}

checkUserPermissions();
