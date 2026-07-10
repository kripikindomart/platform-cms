import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsRepository } from './permissions.repository';
import { DatabaseModule } from '@/database/database.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [PermissionsService, PermissionsRepository],
  exports: [PermissionsService, PermissionsRepository],
})
export class PermissionsModule {}
