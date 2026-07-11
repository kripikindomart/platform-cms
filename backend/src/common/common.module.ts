import { Module, Global } from '@nestjs/common';
import { TenantContextService } from './context/tenant-context.service';
import { TenantGuard } from './guards/tenant.guard';
import { TenantsModule } from '../modules/tenants/tenants.module';

/**
 * Common Module
 * Global module untuk shared services dan utilities
 */
@Global()
@Module({
  imports: [TenantsModule],
  providers: [TenantContextService, TenantGuard],
  exports: [TenantContextService, TenantGuard],
})
export class CommonModule {}
