import { Module, Global } from '@nestjs/common';
import { drizzleProvider } from './drizzle.provider';
import { TenantSchemaService } from './tenant-schema.service';

@Global()
@Module({
  providers: [drizzleProvider, TenantSchemaService],
  exports: [drizzleProvider, TenantSchemaService],
})
export class DatabaseModule {}
