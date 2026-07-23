import { Module } from '@nestjs/common';
import { UploadSettingsController } from './upload-settings.controller';
import { UploadSettingsService } from './upload-settings.service';
import { UploadSettingsRepository } from './upload-settings.repository';
import { CommonModule } from '../../common/common.module';
import { AuditModule } from '../../core/audit/audit.module';
import { DatabaseModule } from '../../database/database.module';
import { CaslModule } from '../../core/casl/casl.module';

@Module({
  imports: [DatabaseModule, CommonModule, AuditModule, CaslModule],
  controllers: [UploadSettingsController],
  providers: [UploadSettingsService, UploadSettingsRepository],
  exports: [UploadSettingsService],
})
export class UploadSettingsModule {}
