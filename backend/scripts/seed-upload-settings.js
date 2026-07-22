/**
 * Seed Upload Settings
 * Seeds default upload settings for all tenant schemas
 */

require('dotenv').config();
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { sql } = require('drizzle-orm');

// File categories and their default URL formats
const DEFAULT_SETTINGS = [
  { category: 'image', url_format: 'direct_view', thumbnail_size: 200 },
  { category: 'document', url_format: 'download', thumbnail_size: 200 },
  { category: 'video', url_format: 'embed_view', thumbnail_size: 200 },
  { category: 'audio', url_format: 'embed_view', thumbnail_size: 200 },
  { category: 'other', url_format: 'download', thumbnail_size: 200 },
];

async function seedUploadSettings() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'platform_cms',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  });

  const db = drizzle(pool);

  try {
    console.log('[OK] Starting upload settings seeding...\n');

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

      // Check if upload_settings table exists in tenant schema
      const tableCheck = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = ${tenant.schema_name}
          AND table_name = 'upload_settings'
        ) as exists
      `);

      const tableExists = (tableCheck.rows || tableCheck)[0]?.exists;

      if (!tableExists) {
        console.log(`  [SKIP] Table upload_settings does not exist in ${tenant.schema_name}`);
        continue;
      }

      // Seed each default setting
      for (const setting of DEFAULT_SETTINGS) {
        // Check if setting already exists
        const existingCheck = await db.execute(sql`
          SELECT id FROM ${sql.identifier(tenant.schema_name)}.upload_settings
          WHERE category = ${setting.category}
          AND deleted_at IS NULL
        `);

        const existing = existingCheck.rows || existingCheck;

        if (existing.length > 0) {
          console.log(`  [EXISTS] ${setting.category} - skipping`);
          continue;
        }

        // Insert new setting
        await db.execute(sql`
          INSERT INTO ${sql.identifier(tenant.schema_name)}.upload_settings
          (category, url_format, thumbnail_size, is_active, created_at, updated_at)
          VALUES (
            ${setting.category},
            ${setting.url_format},
            ${setting.thumbnail_size},
            true,
            NOW(),
            NOW()
          )
        `);

        console.log(`  [OK] ${setting.category} -> ${setting.url_format}`);
      }

      console.log('');
    }

    console.log('[SUCCESS] Upload settings seeding complete!\n');
  } catch (error) {
    console.error('[ERROR] Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seed
seedUploadSettings()
  .then(() => {
    console.log('[DONE] Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[FAIL] Script failed:', error);
    process.exit(1);
  });
