/**
 * CLI Metadata Module
 * Manages metadata for CLI-generated modules
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { CliMetadataService } from './cli-metadata.service';
import { CliMetadataRepository } from './cli-metadata.repository';
import { CliMetadataController } from './cli-metadata.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CliMetadataController],
  providers: [CliMetadataService, CliMetadataRepository],
  exports: [CliMetadataService],
})
export class CliMetadataModule {}
