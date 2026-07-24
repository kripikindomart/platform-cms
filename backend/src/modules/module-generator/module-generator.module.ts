import { Module } from '@nestjs/common';
import { ModuleGeneratorController } from './module-generator.controller';
import { ModuleGeneratorService } from './module-generator.service';
import { ModuleMetadataRepository } from './module-metadata.repository';
import { CodeGenerationService } from './services/code-generation.service';
import { TemplateService } from './services/template.service';
import { FileSystemService } from './services/filesystem.service';
import { DatabaseModule } from '../../database/database.module';
import { CaslModule } from '../../core/casl/casl.module';
import { TenantsModule } from '../tenants/tenants.module';

/**
 * Module Generator Module
 * Handles CRUD Builder UI functionality
 * 
 * Features:
 * - Module metadata management
 * - Code generation (Phase 2)
 * - File system operations
 * - Permission management integration
 */
@Module({
  imports: [
    DatabaseModule,  // Provides Drizzle database access
    CaslModule,      // Provides CASL authorization
    TenantsModule,   // Provides TenantsRepository (resolve tenant schema_name by id)
    // TenantContextService is provided by global CommonModule
  ],
  controllers: [ModuleGeneratorController],
  providers: [
    ModuleGeneratorService,
    ModuleMetadataRepository,
    CodeGenerationService,
    TemplateService,
    FileSystemService,
  ],
  exports: [
    ModuleGeneratorService,
    ModuleMetadataRepository,
  ],
})
export class ModuleGeneratorModule {}
