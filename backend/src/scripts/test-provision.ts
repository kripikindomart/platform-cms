import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TenantsService } from '../modules/tenants/tenants.service';

async function test() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const tenantsService = app.get(TenantsService);

  try {
    console.log('🚀 Creating test tenant...\n');

    const result = await tenantsService.provisionTenant({
      name: 'Demo Company',
      subscriptionTier: 'free',
    });

    console.log('✅ Tenant created successfully!\n');
    console.log('Tenant Details:');
    console.log('---------------');
    console.log(`ID: ${result.tenant.id}`);
    console.log(`Name: ${result.tenant.name}`);
    console.log(`Slug: ${result.tenant.slug}`);
    console.log(`Schema: ${result.tenant.schemaName}`);
    console.log(`Subscription Tier: ${result.tenant.subscriptionTier}`);
    console.log(`Active: ${result.tenant.isActive}`);
    console.log(`Created At: ${result.tenant.createdAt}\n`);

    console.log('Provisioning Stats:');
    console.log('------------------');
    console.log(`Schema Created: ${result.schemaCreated}`);
    console.log(`Tables Created: ${result.tablesCreated}`);
    console.log(`Roles Seeded: ${result.rolesSeeded}`);
    console.log(`Permissions Seeded: ${result.permissionsSeeded}\n`);

    console.log(`✨ ${result.message}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Error:', error.message);
      if ('code' in error) {
        console.error(
          'Error Code:',
          (error as Error & { code: string }).code,
        );
      }
    } else {
      console.error('❌ Unknown error:', error);
    }
    process.exit(1);
  } finally {
    await app.close();
  }
}

test();
