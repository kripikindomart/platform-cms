import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';
import { DatabaseModule } from '@/database/database.module';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [AuditService, AuditRepository],
  exports: [AuditService],
})
export class AuditModule {}
