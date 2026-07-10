#!/usr/bin/env ts-node
/**
 * Tenant Schema CLI
 * Utility commands untuk manage tenant schemas
 *
 * Usage:
 *   npm run tenant:create <name>
 *   npm run tenant:drop <schema>
 *   npm run tenant:list
 *   npm run tenant:info <schema>
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TenantSchemaService } from '../database/tenant-schema.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const tenantSchemaService = app.get(TenantSchemaService);

  const command = process.argv[2];
  const arg = process.argv[3];

  try {
    switch (command) {
      case 'create':
        await createSchema(tenantSchemaService, arg);
        break;

      case 'drop':
        await dropSchema(tenantSchemaService, arg);
        break;

      case 'list':
        await listSchemas(tenantSchemaService);
        break;

      case 'info':
        await schemaInfo(tenantSchemaService, arg);
        break;

      default:
        printHelp();
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function createSchema(
  service: TenantSchemaService,
  name: string,
): Promise<void> {
  if (!name) {
    throw new Error('Schema name is required. Usage: npm run tenant:create <name>');
  }

  // Generate schema name (tenant_xxx)
  const schemaName = name.startsWith('tenant_') ? name : `tenant_${name}`;

  console.log(`Creating schema: ${schemaName}...`);
  await service.createTenantSchema(schemaName);
  console.log(`✅ Schema ${schemaName} created successfully!`);
}

async function dropSchema(
  service: TenantSchemaService,
  schemaName: string,
): Promise<void> {
  if (!schemaName) {
    throw new Error('Schema name is required. Usage: npm run tenant:drop <schema>');
  }

  console.log(`⚠️  WARNING: This will DROP schema ${schemaName} and ALL its data!`);
  console.log('Dropping schema...');
  await service.dropTenantSchema(schemaName);
  console.log(`✅ Schema ${schemaName} dropped successfully!`);
}

async function listSchemas(service: TenantSchemaService): Promise<void> {
  console.log('📋 Listing all tenant schemas...\n');

  const schemas = await service.listAllSchemas();

  if (schemas.length === 0) {
    console.log('No tenant schemas found.');
    return;
  }

  console.log(`Found ${schemas.length} tenant schema(s):\n`);

  for (const schema of schemas) {
    const tableCount = await service.getSchemaTableCount(schema);
    console.log(`  • ${schema} (${tableCount} tables)`);
  }

  console.log('');
}

async function schemaInfo(
  service: TenantSchemaService,
  schemaName: string,
): Promise<void> {
  if (!schemaName) {
    throw new Error('Schema name is required. Usage: npm run tenant:info <schema>');
  }

  console.log(`📊 Schema Info: ${schemaName}\n`);

  const info = await service.getSchemaInfo(schemaName);

  if (!info.exists) {
    console.log(`❌ Schema ${schemaName} does not exist.`);
    return;
  }

  console.log(`  Exists: ✅ Yes`);
  console.log(`  Tables: ${info.tableCount}`);
  console.log(`  Size:   ${info.size}`);
  console.log('');
}

function printHelp(): void {
  console.log(`
🔧 Tenant Schema CLI

Usage:
  npm run tenant:create <name>    Create new tenant schema (tenant_<name>)
  npm run tenant:drop <schema>    Drop tenant schema (CASCADE)
  npm run tenant:list             List all tenant schemas
  npm run tenant:info <schema>    Show schema information

Examples:
  npm run tenant:create demo       → Creates tenant_demo
  npm run tenant:drop tenant_test  → Drops tenant_test schema
  npm run tenant:list              → Lists all schemas
  npm run tenant:info tenant_demo  → Shows info for tenant_demo
`);
}

bootstrap();
