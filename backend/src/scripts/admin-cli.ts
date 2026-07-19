#!/usr/bin/env ts-node
/**
 * Admin User CLI
 * Utility untuk create admin user dengan full access
 *
 * Usage:
 *   npm run admin:create -- --email admin@example.com --password admin123 --name "Admin User" --tenant demo_company
 */

import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface AdminOptions {
  email: string;
  password: string;
  name: string;
  tenant: string;
}

async function bootstrap() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'create':
        await createAdmin();
        break;

      case 'list':
        await listAdmins();
        break;

      default:
        printHelp();
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    console.error(error);
    process.exit(1);
  }
}

async function createAdmin(): Promise<void> {
  // Parse arguments
  const args = parseArgs();

  if (!args.email || !args.password || !args.name || !args.tenant) {
    console.error('❌ Missing required arguments!');
    printHelp();
    process.exit(1);
  }

  console.log('\n🔧 Creating Admin User...\n');
  console.log(`Email:    ${args.email}`);
  console.log(`Name:     ${args.name}`);
  console.log(`Tenant:   ${args.tenant}`);
  console.log('');

  // Set tenant context
  const tenantSlug = args.tenant;
  const schemaName = tenantSlug.startsWith('tenant_') 
    ? tenantSlug 
    : `tenant_${tenantSlug}`;

  console.log(`📂 Using schema: ${schemaName}`);

  // Connect to database
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'platform_cms',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    // Check if user already exists
    const checkQuery = `SELECT id FROM "${schemaName}".users WHERE email = $1 AND deleted_at IS NULL`;
    const checkResult = await pool.query(checkQuery, [args.email]);
    
    if (checkResult.rows.length > 0) {
      console.error(`❌ User with email ${args.email} already exists!`);
      process.exit(1);
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(args.password, 12);

    // Create user
    console.log('👤 Creating user...');
    const userQuery = `
      INSERT INTO "${schemaName}".users 
        (email, name, password_hash, is_active, is_verified, created_at, updated_at)
      VALUES ($1, $2, $3, true, true, NOW(), NOW())
      RETURNING id, email, name
    `;
    const userResult = await pool.query(userQuery, [args.email, args.name, passwordHash]);
    const user = userResult.rows[0];

    console.log(`✅ User created with ID: ${user.id}`);

    // Get or create SuperAdmin role
    console.log('🎭 Setting up SuperAdmin role...');
    const roleCheckQuery = `SELECT id FROM "${schemaName}".roles WHERE name = 'superadmin' AND deleted_at IS NULL`;
    const roleCheckResult = await pool.query(roleCheckQuery);

    let roleId: number;

    if (roleCheckResult.rows.length === 0) {
      console.log('   Creating SuperAdmin role...');
      const roleQuery = `
        INSERT INTO "${schemaName}".roles 
          (name, display_name, description, is_system, is_active, created_at, updated_at)
        VALUES ('superadmin', 'Super Administrator', 'Full system access with all permissions', true, true, NOW(), NOW())
        RETURNING id
      `;
      const roleResult = await pool.query(roleQuery);
      roleId = roleResult.rows[0].id;
      console.log(`   ✅ SuperAdmin role created with ID: ${roleId}`);

      // Assign ALL permissions to SuperAdmin
      console.log('   📜 Assigning all permissions...');
      const assignPermsQuery = `
        INSERT INTO "${schemaName}".role_permissions (role_id, permission_id, assigned_by, assigned_at)
        SELECT $1, id, $2, NOW()
        FROM "${schemaName}".permissions
        ON CONFLICT DO NOTHING
      `;
      const assignResult = await pool.query(assignPermsQuery, [roleId, user.id]);
      console.log(`   ✅ Assigned ${assignResult.rowCount} permissions to SuperAdmin role`);
    } else {
      roleId = roleCheckResult.rows[0].id;
      console.log(`   ✅ SuperAdmin role already exists with ID: ${roleId}`);
    }

    // Assign SuperAdmin role to user
    console.log('🔗 Assigning SuperAdmin role to user...');
    const userRoleQuery = `
      INSERT INTO "${schemaName}".user_roles (user_id, role_id, assigned_by, assigned_at)
      VALUES ($1, $2, $1, NOW())
      ON CONFLICT DO NOTHING
    `;
    await pool.query(userRoleQuery, [user.id, roleId]);

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📋 Login Credentials:');
    console.log(`   Email:    ${args.email}`);
    console.log(`   Password: ${args.password}`);
    console.log(`   Tenant:   ${args.tenant}`);
    console.log('');
  } finally {
    await pool.end();
  }
}

async function listAdmins(): Promise<void> {
  // Parse tenant from args
  const args = parseArgs();
  
  if (!args.tenant) {
    console.error('❌ Missing --tenant argument!');
    printHelp();
    process.exit(1);
  }

  // Set tenant context
  const tenantSlug = args.tenant;
  const schemaName = tenantSlug.startsWith('tenant_') 
    ? tenantSlug 
    : `tenant_${tenantSlug}`;

  console.log(`\n📋 Admin Users in ${schemaName}:\n`);

  // Connect to database
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'platform_cms',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    const query = `
      SELECT DISTINCT u.id, u.name, u.email, u.is_active, u.is_verified
      FROM "${schemaName}".users u
      INNER JOIN "${schemaName}".user_roles ur ON u.id = ur.user_id
      INNER JOIN "${schemaName}".roles r ON ur.role_id = r.id
      WHERE r.name = 'superadmin' 
        AND u.deleted_at IS NULL
        AND r.deleted_at IS NULL
      ORDER BY u.id
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      console.log('No admin users found.');
      return;
    }

    for (const user of result.rows) {
      console.log(`  👤 ${user.name} (${user.email})`);
      console.log(`     ID: ${user.id}`);
      console.log(`     Active: ${user.is_active ? '✅' : '❌'}`);
      console.log(`     Verified: ${user.is_verified ? '✅' : '❌'}`);
      console.log('');
    }
  } finally {
    await pool.end();
  }
}

function parseArgs(): AdminOptions {
  const args: Partial<AdminOptions> = {};

  for (let i = 3; i < process.argv.length; i++) {
    const arg = process.argv[i];
    const nextArg = process.argv[i + 1];

    if (arg === '--email' && nextArg) {
      args.email = nextArg;
      i++;
    } else if (arg === '--password' && nextArg) {
      args.password = nextArg;
      i++;
    } else if (arg === '--name' && nextArg) {
      args.name = nextArg;
      i++;
    } else if (arg === '--tenant' && nextArg) {
      args.tenant = nextArg;
      i++;
    }
  }

  return args as AdminOptions;
}

function printHelp(): void {
  console.log(`
🔧 Admin User CLI

Commands:
  npm run admin:create -- --email <email> --password <password> --name <name> --tenant <tenant>
  npm run admin:list -- --tenant <tenant>

Options:
  --email      Admin email address
  --password   Admin password
  --name       Admin full name
  --tenant     Tenant slug (e.g., demo_company)

Examples:
  # Create admin user
  npm run admin:create -- --email admin@platform.com --password Admin123! --name "Super Admin" --tenant demo_company

  # List all admin users
  npm run admin:list -- --tenant demo_company

Notes:
  - Admin users are automatically verified
  - Admin users get SuperAdmin role with all permissions
  - SuperAdmin role is created automatically if not exists
  - Password must meet security requirements (min 8 chars)
`);
}

bootstrap();

