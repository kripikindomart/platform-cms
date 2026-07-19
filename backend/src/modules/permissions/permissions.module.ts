import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsRepository } from './permissions.repository';
import { PermissionsController } from './permissions.controller';
import { DatabaseModule } from '@/database/database.module';
import { CommonModule } from '@/common/common.module';
import { CaslModule } from '@/core/casl/casl.module';

@Module({
  imports: [DatabaseModule, CommonModule, CaslModule],
  controllers: [PermissionsController],
  providers: [PermissionsService, PermissionsRepository],
  exports: [PermissionsService, PermissionsRepository],
})
export class PermissionsModule {}
