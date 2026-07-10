import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolesRepository } from './roles.repository';
import { DatabaseModule } from '@/database/database.module';
import { CommonModule } from '@/common/common.module';
import { PermissionsModule } from '@/modules/permissions/permissions.module';
import { CaslModule } from '@/core/casl/casl.module';

@Module({
  imports: [DatabaseModule, CommonModule, PermissionsModule, CaslModule],
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
  exports: [RolesService, RolesRepository],
})
export class RolesModule {}
