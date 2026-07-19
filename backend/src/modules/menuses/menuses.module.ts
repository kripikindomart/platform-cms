import { Module } from '@nestjs/common';
import { MenusController } from './menuses.controller';
import { MenusService } from './menuses.service';
import { MenusRepository } from './menuses.repository';
import { CommonModule } from '../../common/common.module';
import { AuditModule } from '../../core/audit/audit.module';
import { DatabaseModule } from '../../database/database.module';
import { CaslModule } from '../../core/casl/casl.module';

@Module({
  imports: [DatabaseModule, CommonModule, AuditModule, CaslModule],
  controllers: [MenusController],
  providers: [MenusService, MenusRepository],
  exports: [MenusService],
})
export class MenusModule {}
