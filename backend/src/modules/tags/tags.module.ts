import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { TagsRepository } from './tags.repository';
import { CommonModule } from '../../common/common.module';
import { AuditModule } from '../../core/audit/audit.module';
import { DatabaseModule } from '../../database/database.module';
import { CaslModule } from '../../core/casl/casl.module';

@Module({
  imports: [DatabaseModule, CommonModule, AuditModule, CaslModule],
  controllers: [TagsController],
  providers: [TagsService, TagsRepository],
  exports: [TagsService],
})
export class TagsModule {}
