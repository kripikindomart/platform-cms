/**
 * Initialize Platform Admin Tenant
 * 
 * This script creates:
 * 1. Platform admin tenant with random 26-char slug
 * 2. Schema with all necessary tables
 * 3. SuperAdmin role with cross-tenant permissions
 * 4. First SuperAdmin user (optional)
 * 
 * Run: npx tsx scripts/init-platform-admin.ts
 */

import { customAlphabet } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

dotenv.config();

const generateSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 26);

interface CreateSuperAdminInput {
  email: string;
  password: string;
  name: string;
}

async function promptUserInput(): Promise<CreateSuperAdminInput | null> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('\n❓ Do you want to create a SuperAdmin user now? (y/n): ', (answer) => {
      if (answer.toLowerCase() !== 'y') {
        rl.close();
        resolve(null);
        return;
      }

      rl.question('Email: ', (email) => {
        rl.question('Password: ', (password) => {
          rl.question('Name: ', (name) => {
            rl.close();
            resolve({ email, password, name });
          });
        });
      });
    });
  });
}

async function main() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'platform_cms',
  });

  const db = drizzle(pool);

  console.log('🚀 Initializing Platform Admin Tenant...\n');

  try {
    // 1. Check if platform admin already exists
    const existing = await db.execute(sql`
      SELECT id, slug, name FROM public.tenants 
      WHERE is_platform_admin = true
      LIMIT 1
    `);

    if (existing.rows.length > 0) {
      const tenant = existing.rows[0] as any;
      console.log('⚠️  Platform Admin tenant already exists!');
      console.log(`   Name: ${tenant.name}`);
      console.log(`   Slug: ${tenant.slug}`);
      console.log(`   URL: /org/${tenant.slug}/portal\n`);
      
      const shouldContinue = await new Promise<boolean>((resolve) => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question('Do you want to create another SuperAdmin user? (y/n): ', (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 'y');
        });
      });

      if (shouldContinue) {
        await createSuperAdminUser(db, tenant.slug, tenant.id);
      }
      
      await pool.end();
      return;
    }

    // 2. Generate random slug
    const slug = generateSlug();
    const schemaName = `tenant_${slug}`;

    console.log('📝 Platform Admin Details:');
    console.log(`   Slug: ${slug}`);
    console.log(`   Schema: ${schemaName}`);
    console.log(`   URL: /org/${slug}/portal\n`);
    console.log('⚠️  IMPORTANT: Save this slug securely! It\'s your platform admin access URL.\n');

    // 3. Create tenant record
    console.log('⏳ Creating platform admin tenant record...');
    const tenantResult = await db.execute(sql`
      INSERT INTO public.tenants (name, slug, schema_name, is_platform_admin, is_active, created_at, updated_at)
      VALUES ('Platform Administration', ${slug}, ${schemaName}, true, true, NOW(), NOW())
      RETURNING id
    `);
    const tenantId = (tenantResult.rows[0] as any).id;
    console.log(`✅ Tenant created (ID: ${tenantId})\n`);

    // 4. Create schema
    console.log(`⏳ Creating schema: ${schemaName}...`);
    await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`));
    console.log('✅ Schema created\n');

    // 5. Create tables
    console.log('⏳ Creating tables...');
    await createPlatformAdminTables(db, schemaName);
    console.log('✅ Tables created\n');

    // 6. Seed SuperAdmin role and permissions
    console.log('⏳ Seeding SuperAdmin role and permissions...');
    await seedSuperAdminRole(db, schemaName);
    console.log('✅ Role and permissions created\n');

    // 7. Optionally create SuperAdmin user
    const userInput = await promptUserInput();
    if (userInput) {
      await createSuperAdminUser(db, slug, tenantId, userInput);
    }

    console.log('\n✅ Platform Admin initialization complete!\n');
    console.log('📋 Summary:');
    console.log(`   Platform Admin URL: http://localhost:3000/org/${slug}/portal`);
    console.log(`   Tenant Slug: ${slug}`);
    console.log(`   Tenant ID: ${tenantId}`);
    console.log('\n⚠️  CRITICAL: Save the slug in a secure location!');
    console.log('   You\'ll need it to access the platform admin portal.\n');

  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function createPlatformAdminTables(db: any, schemaName: string): Promise<void> {
  await db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

  try {
    // Roles table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS roles (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        display_name VARCHAR(255) NOT NULL,
        description TEXT,
        is_system BOOLEAN NOT NULL DEFAULT false,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
        updated_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL
      )
    `);

    // Permissions table with cross-tenant flag
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS permissions (
        id BIGSERIAL PRIMARY KEY,
        resource VARCHAR(100) NOT NULL,
        action VARCHAR(50) NOT NULL,
        scope VARCHAR(50) NOT NULL,
        description TEXT,
        is_cross_tenant BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(resource, action, scope)
      )
    `);

    // User roles
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_roles (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        assigned_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
        UNIQUE(user_id, role_id)
      )
    `);

    // Role permissions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id BIGSERIAL PRIMARY KEY,
        role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        assigned_by BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
        UNIQUE(role_id, permission_id)
      )
    `);

    // Audit logs
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
        tenant_id BIGINT REFERENCES public.tenants(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100),
        resource_id BIGINT,
        metadata JSONB,
        ip_address INET,
        user_agent TEXT,
        is_platform_audit BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Tenant health tracking
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tenant_health (
        id BIGSERIAL PRIMARY KEY,
        tenant_id BIGINT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE UNIQUE,
        status VARCHAR(50) NOT NULL DEFAULT 'healthy',
        last_check_at TIMESTAMP WITH TIME ZONE,
        consecutive_failures INTEGER DEFAULT 0,
        last_error TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_tenant_health_tenant_id ON tenant_health(tenant_id)`);

  } finally {
    await db.execute(sql.raw(`RESET search_path`));
  }
}

async function seedSuperAdminRole(db: any, schemaName: string): Promise<void> {
  await db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

  try {
    // Create SuperAdmin role
    await db.execute(sql`
      INSERT INTO roles (name, display_name, description, is_system, is_active, created_at, updated_at)
      VALUES (
        'superadmin',
        'Super Administrator',
        'Platform administrator with full cross-tenant access',
        true,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (name) DO NOTHING
      RETURNING id
    `);

    // Get role ID
    const roleResult = await db.execute(sql`
      SELECT id FROM roles WHERE name = 'superadmin' LIMIT 1
    `);
    const roleId = (roleResult.rows[0] as any).id;

    // Create cross-tenant permissions
    const permissions = [
      { resource: 'tenant', action: 'create', scope: 'platform', isCrossTenant: true },
      { resource: 'tenant', action: 'read', scope: 'platform', isCrossTenant: true },
      { resource: 'tenant', action: 'update', scope: 'platform', isCrossTenant: true },
      { resource: 'tenant', action: 'delete', scope: 'platform', isCrossTenant: true },
      { resource: 'user', action: 'assign_tenant', scope: 'platform', isCrossTenant: true },
      { resource: 'settings', action: 'update', scope: 'platform', isCrossTenant: true },
      { resource: 'audit', action: 'read', scope: 'platform', isCrossTenant: true },
      { resource: 'health', action: 'read', scope: 'platform', isCrossTenant: true },
    ];

    for (const perm of permissions) {
      const permResult = await db.execute(sql`
        INSERT INTO permissions (resource, action, scope, is_cross_tenant, created_at)
        VALUES (${perm.resource}, ${perm.action}, ${perm.scope}, ${perm.isCrossTenant}, NOW())
        ON CONFLICT (resource, action, scope) DO NOTHING
        RETURNING id
      `);

      // Assign permission to SuperAdmin role
      if (permResult.rows.length > 0) {
        const permId = (permResult.rows[0] as any).id;
        await db.execute(sql`
          INSERT INTO role_permissions (role_id, permission_id, assigned_at)
          VALUES (${roleId}, ${permId}, NOW())
          ON CONFLICT (role_id, permission_id) DO NOTHING
        `);
      }
    }

  } finally {
    await db.execute(sql.raw(`RESET search_path`));
  }
}

async function createSuperAdminUser(
  db: any,
  tenantSlug: string,
  tenantId: number,
  userInput?: CreateSuperAdminInput
): Promise<void> {
  const schemaName = `tenant_${tenantSlug}`;

  if (!userInput) {
    userInput = await promptUserInput();
    if (!userInput) {
      console.log('ℹ️  Skipping SuperAdmin user creation');
      return;
    }
  }

  console.log('\n⏳ Creating SuperAdmin user...');

  // Hash password
  const passwordHash = await bcrypt.hash(userInput.password, 12);

  // Check if user already exists
  const existingUser = await db.execute(sql`
    SELECT id FROM public.users WHERE email = ${userInput.email} LIMIT 1
  `);

  let userId: number;

  if (existingUser.rows.length > 0) {
    userId = (existingUser.rows[0] as any).id;
    console.log(`ℹ️  User already exists (ID: ${userId})`);
  } else {
    // Create user in public.users
    const userResult = await db.execute(sql`
      INSERT INTO public.users (email, password_hash, name, is_active, is_verified, created_at, updated_at)
      VALUES (${userInput.email}, ${passwordHash}, ${userInput.name}, true, true, NOW(), NOW())
      RETURNING id
    `);
    userId = (userResult.rows[0] as any).id;
    console.log(`✅ User created (ID: ${userId})`);
  }

  // Assign SuperAdmin role
  await db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));

  try {
    const roleResult = await db.execute(sql`
      SELECT id FROM roles WHERE name = 'superadmin' LIMIT 1
    `);
    const roleId = (roleResult.rows[0] as any).id;

    await db.execute(sql`
      INSERT INTO user_roles (user_id, role_id, assigned_at)
      VALUES (${userId}, ${roleId}, NOW())
      ON CONFLICT (user_id, role_id) DO NOTHING
    `);

    console.log('✅ SuperAdmin role assigned');

    console.log('\n👤 SuperAdmin User:');
    console.log(`   Email: ${userInput.email}`);
    console.log(`   Name: ${userInput.name}`);
    console.log(`   Login URL: http://localhost:3000/login`);
    console.log(`   Use X-Tenant-Slug: ${tenantSlug} in API requests`);

  } finally {
    await db.execute(sql.raw(`RESET search_path`));
  }
}

main();
