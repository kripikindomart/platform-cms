/**
 * Migration Script: Update existing tenant slugs to random 26-char format
 * 
 * This script:
 * 1. Generates random 26-character slugs for existing tenants
 * 2. Renames schemas from tenant_old_slug to tenant_new_slug
 * 3. Updates tenant records in public.tenants
 * 
 * Run: npm run ts-node scripts/migrate-tenant-slugs.ts
 */

import { customAlphabet } from 'nanoid';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const generateSlug = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 26);

interface Tenant {
  id: number;
  slug: string;
  name: string;
  schema_name: string;
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

  console.log('🚀 Starting tenant slug migration...\n');

  try {
    // Add is_platform_admin column if not exists
    console.log('📝 Ensuring is_platform_admin column exists...');
    await db.execute(sql`
      ALTER TABLE public.tenants 
      ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT false
    `);
    console.log('✅ Column added/verified\n');

    // Fetch existing tenants (exclude platform admin if exists)
    const result = await db.execute(sql`
      SELECT id, slug, name, schema_name 
      FROM public.tenants 
      WHERE is_platform_admin = false OR is_platform_admin IS NULL
      ORDER BY id
    `);

    const tenants = result.rows as any[];

    if (tenants.length === 0) {
      console.log('✅ No tenants to migrate');
      await pool.end();
      return;
    }

    console.log(`Found ${tenants.length} tenant(s) to migrate:\n`);

    for (const tenant of tenants) {
      console.log(`📦 Migrating: ${tenant.name} (${tenant.slug})`);
      console.log(`   Current schema: ${tenant.schema_name}`);

      // Generate new random slug
      let newSlug = generateSlug();
      let isUnique = false;

      while (!isUnique) {
        // Check if slug already exists
        const check = await db.execute(sql`
          SELECT id FROM public.tenants WHERE slug = ${newSlug}
        `);
        
        if (check.rows.length === 0) {
          isUnique = true;
        } else {
          newSlug = generateSlug();
        }
      }

      const newSchemaName = `tenant_${newSlug}`;
      const oldSchemaName = tenant.schema_name;

      console.log(`   New slug: ${newSlug}`);
      console.log(`   New schema: ${newSchemaName}`);

      // Start transaction
      await db.execute(sql`BEGIN`);

      try {
        // 1. Rename schema
        console.log(`   ⏳ Renaming schema...`);
        await db.execute(
          sql.raw(`ALTER SCHEMA "${oldSchemaName}" RENAME TO "${newSchemaName}"`)
        );

        // 2. Update tenant record
        console.log(`   ⏳ Updating tenant record...`);
        await db.execute(sql`
          UPDATE public.tenants 
          SET slug = ${newSlug}, 
              schema_name = ${newSchemaName},
              updated_at = NOW()
          WHERE id = ${tenant.id}
        `);

        // Commit transaction
        await db.execute(sql`COMMIT`);

        console.log(`   ✅ Migration successful!\n`);
        console.log(`   📋 Summary:`);
        console.log(`      Old URL: /org/${tenant.slug}/portal`);
        console.log(`      New URL: /org/${newSlug}/portal`);
        console.log(`      ⚠️  IMPORTANT: Save this new slug securely!\n`);

      } catch (error) {
        // Rollback on error
        await db.execute(sql`ROLLBACK`);
        console.error(`   ❌ Migration failed for ${tenant.name}:`, error);
        throw error;
      }
    }

    console.log('\n✅ All tenants migrated successfully!');
    console.log('\n⚠️  NEXT STEPS:');
    console.log('1. Update frontend routes to use new slugs');
    console.log('2. Update any hardcoded tenant references');
    console.log('3. Inform users of new URLs');
    console.log('4. Update cookies/localStorage for selected tenants\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
