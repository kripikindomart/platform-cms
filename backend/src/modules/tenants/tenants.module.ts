import { Module } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { TenantsRepository } from './tenants.repository';
import { TenantSchemaBackupsRepository } from './tenant-schema-backups.repository';
import { TenantsController } from './tenants.controller';
import { DatabaseModule } from '../../database/database.module';
import { CaslModule } from '../../core/casl/casl.module';

@Module({
  imports: [DatabaseModule, CaslModule],
  controllers: [TenantsController],
  providers: [TenantsService, TenantsRepository, TenantSchemaBackupsRepository],
  exports: [TenantsService, TenantsRepository, TenantSchemaBackupsRepository],
})
export class TenantsModule {}
