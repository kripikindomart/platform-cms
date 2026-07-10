import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsRepository } from './posts.repository';
import { CommonModule } from '../../common/common.module';
import { AuditModule } from '../../core/audit/audit.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, CommonModule, AuditModule],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository],
  exports: [PostsService],
})
export class PostsModule {}
