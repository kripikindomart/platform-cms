import { Module, Global } from '@nestjs/common';
import { TenantContextService } from './context/tenant-context.service';

/**
 * Common Module
 * Global module untuk shared services dan utilities
 */
@Global()
@Module({
  providers: [TenantContextService],
  exports: [TenantContextService],
})
export class CommonModule {}
