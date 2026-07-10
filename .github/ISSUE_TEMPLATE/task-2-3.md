# Task 2.3: Migration System Implementation

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 5 jam  
**Dependencies**: Task 2.1, 2.2  
**Status**: Belum Dimulai

---

## Tujuan Task

Implement migration system untuk mengelola database schema migrations, baik untuk global schema (public) maupun tenant schemas. System ini harus support create, rollback, dan status tracking migrations.

---

## Yang Akan Dikerjakan

### 1. Struktur File

File yang akan dibuat:

```
backend/src/database/
├── migration.service.ts          (baru) - Migration service
├── tenant-schema.service.ts      (baru) - Tenant schema operations
└── database.module.ts            (update) - Register services

backend/src/cli/
├── commands/
│   ├── migrate.command.ts        (baru) - Run migrations
│   └── tenant.command.ts         (baru) - Tenant operations
└── cli.module.ts                 (baru) - CLI module

backend/package.json              (update) - Add CLI scripts
```

### 2. Migration Service

**Fungsi**: Service untuk menjalankan migrations

**Methods**:
- `runGlobalMigrations()` - Run migrations untuk public schema
- `runTenantMigrations(schemaName)` - Run migrations untuk tenant schema
- `runForAllTenants()` - Run migrations untuk semua tenant active
- `getMigrationStatus()` - Get migration status
- `rollbackMigration(steps)` - Rollback migrations

**Features**:
- Connection pooling untuk performance
- Error handling dan logging
- Transaction support untuk rollback
- Migration history tracking

### 3. Tenant Schema Service

**Fungsi**: Service untuk operasi tenant schema

**Methods**:
- `createTenantSchema(schemaName)` - CREATE SCHEMA in PostgreSQL
- `dropTenantSchema(schemaName)` - DROP SCHEMA CASCADE
- `schemaExists(schemaName)` - Check if schema exists
- `listAllSchemas()` - List all tenant schemas
- `cloneTenantSchema(fromSchema, toSchema)` - Clone schema for testing

**Features**:
- SQL injection protection
- Validation schema name format (tenant_xxx)
- Audit logging untuk schema operations
- Error handling

### 4. CLI Commands

**Fungsi**: Command-line interface untuk migrations

**Commands**:
```bash
# Migration commands
npm run migrate:global          # Run global migrations
npm run migrate:tenant <schema> # Run tenant migrations
npm run migrate:all-tenants     # Run for all active tenants
npm run migrate:status          # Show migration status
npm run migrate:rollback        # Rollback last migration

# Tenant schema commands
npm run tenant:create <name>    # Create new tenant schema
npm run tenant:drop <schema>    # Drop tenant schema
npm run tenant:list             # List all tenant schemas
```

**Implementation**: Use NestJS Commander or custom CLI

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] File `migration.service.ts` sudah dibuat
- [ ] File `tenant-schema.service.ts` sudah dibuat
- [ ] File `cli.module.ts` dan command files sudah dibuat
- [ ] Database module updated dengan services
- [ ] CLI scripts added to package.json
- [ ] Can run global migrations successfully
- [ ] Can run tenant migrations for specific schema
- [ ] Can run migrations for all active tenants
- [ ] Migration status command shows correct info
- [ ] Rollback functionality works
- [ ] Schema create/drop operations working
- [ ] Error handling implemented
- [ ] Logging implemented
- [ ] Command `npm run type-check` berhasil tanpa error
- [ ] Command `npm run lint` berhasil tanpa error
- [ ] All tests passing

---

## Cara Testing

### 1. Test Global Migration

```bash
npm run migrate:global
```

Expected: Global schema tables created

### 2. Test Create Tenant Schema

```bash
npm run tenant:create test
```

Expected: Schema `tenant_test` created

### 3. Test Tenant Migration

```bash
npm run migrate:tenant tenant_test
```

Expected: All 11 tenant tables created in `tenant_test` schema

### 4. Test Migration Status

```bash
npm run migrate:status
```

Expected output:
```
Migration Status:
- Global Schema: 2 migrations applied
- Tenant Schemas:
  - tenant_test: 1 migration applied
  - tenant_demo: 1 migration applied
```

### 5. Test Migrate All Tenants

Create tenant record first:
```sql
INSERT INTO public.tenants (name, slug, schema_name, subscription_tier, is_active)
VALUES ('Demo Tenant', 'demo', 'tenant_demo', 'free', true);
```

Then run:
```bash
npm run migrate:all-tenants
```

Expected: Migrations run for all active tenants

### 6. Test Rollback

```bash
npm run migrate:rollback
```

Expected: Last migration rolled back

### 7. Test Schema Operations

```bash
# List schemas
npm run tenant:list

# Drop schema
npm run tenant:drop tenant_test

# Verify dropped
npm run tenant:list
```

---

## Implementasi Notes

### Migration with Drizzle

Drizzle ORM provides built-in migration support:

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

// Run migration
const pool = new Pool({ /* config */ });
const db = drizzle(pool);
await migrate(db, { migrationsFolder: './drizzle' });
```

### Schema Operations

Create schema with validation:

```typescript
async createTenantSchema(schemaName: string): Promise<void> {
  // Validate schema name format
  if (!schemaName.match(/^tenant_[a-z0-9_]+$/)) {
    throw new Error('Invalid schema name format');
  }

  // Check if already exists
  const exists = await this.schemaExists(schemaName);
  if (exists) {
    throw new Error(`Schema ${schemaName} already exists`);
  }

  // Create schema (use parameterized query to prevent SQL injection)
  await this.db.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.identifier(schemaName)}`);
  
  // Audit log
  await this.auditService.log('create', 'schema', schemaName);
}
```

### Multi-Tenant Migration

Run migrations for all active tenants:

```typescript
async runForAllTenants(): Promise<void> {
  // Get all active tenants
  const tenants = await this.db.query.tenants.findMany({
    where: eq(tenants.is_active, true),
  });

  console.log(`Running migrations for ${tenants.length} tenants...`);

  for (const tenant of tenants) {
    try {
      console.log(`Migrating ${tenant.schema_name}...`);
      await this.runTenantMigrations(tenant.schema_name);
      console.log(`✓ ${tenant.schema_name} migrated successfully`);
    } catch (error) {
      console.error(`✗ ${tenant.schema_name} migration failed:`, error);
      // Continue with other tenants
    }
  }
}
```

### CLI Implementation Options

**Option 1: NestJS Commander** (Recommended)
```bash
npm install nest-commander
```

```typescript
import { Command, CommandRunner } from 'nest-commander';

@Command({ name: 'migrate:global', description: 'Run global migrations' })
export class MigrateGlobalCommand extends CommandRunner {
  constructor(private migrationService: MigrationService) {
    super();
  }

  async run(): Promise<void> {
    await this.migrationService.runGlobalMigrations();
  }
}
```

**Option 2: Custom CLI Script** (Simpler)
```typescript
// scripts/migrate.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MigrationService } from './database/migration.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);
  
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'global':
      await migrationService.runGlobalMigrations();
      break;
    case 'tenant':
      await migrationService.runTenantMigrations(arg);
      break;
    case 'all-tenants':
      await migrationService.runForAllTenants();
      break;
    default:
      console.error('Unknown command');
  }
  
  await app.close();
}

bootstrap();
```

### Error Handling

```typescript
async runTenantMigrations(schemaName: string): Promise<void> {
  try {
    // Validate schema exists
    const exists = await this.schemaService.schemaExists(schemaName);
    if (!exists) {
      throw new Error(`Schema ${schemaName} does not exist`);
    }

    // Set search_path for this connection
    await this.pool.query(`SET search_path TO ${schemaName}, public`);

    // Run migrations
    const db = drizzle(this.pool);
    await migrate(db, { migrationsFolder: './drizzle' });

    console.log(`✓ Migrations completed for ${schemaName}`);
  } catch (error) {
    console.error(`✗ Migration failed for ${schemaName}:`, error);
    throw error;
  } finally {
    // Reset search_path
    await this.pool.query('RESET search_path');
  }
}
```

---

## Troubleshooting

**Problem**: Migration fails with "relation already exists"  
**Solution**: Drizzle migrations are idempotent, check if migration was already applied

**Problem**: Cannot create schema, permission denied  
**Solution**: Ensure database user has CREATE SCHEMA privilege

**Problem**: Migration hangs on tenant schema  
**Solution**: Check for active connections to that schema, close them first

**Problem**: Search_path not working  
**Solution**: Use `SET search_path TO tenant_xxx, public` before running migrations

**Problem**: Rollback not working  
**Solution**: Drizzle doesn't support automatic rollback, need to write down migrations manually

---

## Security Notes

1. **SQL Injection**: Always use `sql.identifier()` untuk schema names
2. **Validation**: Validate schema name format (tenant_xxx)
3. **Permissions**: Restrict schema operations to admin only
4. **Audit**: Log all schema create/drop operations
5. **Backup**: Always backup before running migrations on production

---

## Documentation References

- AI-RULES.md Section 7.3 - Migration rules
- TECHNICAL-ARCHITECTURE.md Section 4.3 - Tenant provisioning flow
- Drizzle ORM Migrations: https://orm.drizzle.team/docs/migrations

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 2.4: Tenant Middleware Implementation** - Implement middleware untuk tenant context extraction

---

## Output Expected

Setelah task selesai:
1. Migration service implemented dengan 5+ methods
2. Tenant schema service implemented dengan 5+ methods
3. CLI commands untuk migration operations
4. Can run migrations untuk global dan tenant schemas
5. Can run migrations untuk all active tenants
6. Migration status tracking working
7. Schema create/drop operations working
8. Error handling implemented
9. Logging implemented
10. All tests passing
11. Documentation updated

**Total Complexity**:
- 2 new services
- 5+ CLI commands
- Error handling & logging
- Transaction management
- Multi-tenant support
