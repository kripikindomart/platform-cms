import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { TenantsService } from '../modules/tenants/tenants.service';

async function setup() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const tenantsService = app.get(TenantsService);

    console.log('🚀 Setting up test environment for authentication...\n');

    // Check if demo tenant already exists
    const existingTenant = await tenantsService.findBySlug('demo_company');

    if (existingTenant) {
      console.log('✅ Test tenant already exists:');
      console.log(`   ID: ${existingTenant.id}`);
      console.log(`   Name: ${existingTenant.name}`);
      console.log(`   Slug: ${existingTenant.slug}`);
      console.log(`   Schema: ${existingTenant.schema_name}\n`);
      console.log('✨ Ready for authentication testing!');
      console.log('   Tenant ID: 1');
      console.log('   Schema: tenant_demo_company\n');
    } else {
      console.log('Creating test tenant...');

      const result = await tenantsService.provisionTenant({
        name: 'Demo Company',
        subscription_tier: 'free',
      });

      console.log('\n✅ Test tenant created successfully!');
      console.log(`   ID: ${result.tenant.id}`);
      console.log(`   Name: ${result.tenant.name}`);
      console.log(`   Slug: ${result.tenant.slug}`);
      console.log(`   Schema: ${result.tenant.schema_name}`);
      console.log(`   Tables: ${result.tablesCreated}`);
      console.log(`   Roles: ${result.rolesSeeded}`);
      console.log(`   Permissions: ${result.permissionsSeeded}\n`);
      console.log('✨ Ready for authentication testing!');
    }

    console.log('\n📝 Next steps:');
    console.log('   1. Start the server: npm run start:dev');
    console.log('   2. Register a user: POST http://localhost:3000/api/auth/register');
    console.log('   3. Login: POST http://localhost:3000/api/auth/login');
    console.log('   4. Access protected route with JWT token\n');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

setup();
