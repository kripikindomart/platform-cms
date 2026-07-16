import { Module } from '@nestjs/common';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsRepository } from './menu-items.repository';
import { CommonModule } from '../../common/common.module';
import { AuditModule } from '../../core/audit/audit.module';
import { DatabaseModule } from '../../database/database.module';
import { CaslModule } from '../../core/casl/casl.module';

@Module({
  imports: [DatabaseModule, CommonModule, AuditModule, CaslModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService, MenuItemsRepository],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
