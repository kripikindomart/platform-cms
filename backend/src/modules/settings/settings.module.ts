import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { StorageSettingsController } from './storage-settings.controller';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [SettingsController, StorageSettingsController],
  providers: [SettingsService, SettingsRepository],
  exports: [SettingsService, SettingsRepository],
})
export class SettingsModule {}
