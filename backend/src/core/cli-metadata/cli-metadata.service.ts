/**
 * CLI Metadata Service
 * Business logic for CLI metadata operations
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CliMetadataRepository } from './cli-metadata.repository';
import {
  GeneratedModule,
  ModuleField,
  FieldValidation,
  GenerationHistory,
} from '@/database/schema/public';

export interface SaveModuleMetadataDto {
  name: string;
  displayName: string;
  description?: string;
  hasTenantIsolation: boolean;
  hasSoftDelete: boolean;
  hasAudit: boolean;
  generatedFiles: string[];
  cliCommand: string;
  generatorVersion: string;
  fields: SaveFieldMetadataDto[];
  createdBy?: number;
}

export interface SaveFieldMetadataDto {
  name: string;
  displayName: string;
  description?: string;
  fieldType: string;
  isRequired: boolean;
  isUnique: boolean;
  isNullable: boolean;
  defaultValue?: string;
  length?: number;
  precision?: number;
  scale?: number;
  enumValues?: string[];
  relationModule?: string;
  relationType?: string;
  inputType: string;
  placeholder?: string;
  helpText?: string;
  isSearchable: boolean;
  isSortable: boolean;
  isFilterable: boolean;
  showInList: boolean;
  showInDetail: boolean;
  showInForm: boolean;
  order: number;
  validations: SaveValidationMetadataDto[];
}

export interface SaveValidationMetadataDto {
  validationType: string;
  validationParams?: Record<string, unknown>;
  errorMessage?: string;
  order: number;
}

export interface RecordGenerationDto {
  operation: 'generate' | 'update' | 'delete';
  moduleId?: number;
  command: string;
  options?: Record<string, unknown>;
  success: boolean;
  errorMessage?: string;
  filesCreated?: string[];
  filesModified?: string[];
  filesDeleted?: string[];
  canRollback?: boolean;
  rollbackData?: Record<string, unknown>;
  createdBy?: number;
}

type ModuleWithFields = GeneratedModule & {
  fields: (ModuleField & { validations: FieldValidation[] })[];
};

@Injectable()
export class CliMetadataService {
  constructor(private repository: CliMetadataRepository) {}

  // ============================================================================
  // SAVE OPERATIONS
  // ============================================================================

  /**
   * Save complete module metadata (module + fields + validations)
   * This is the main method called by CLI after generating a module
   */
  async saveModuleMetadata(dto: SaveModuleMetadataDto): Promise<GeneratedModule> {
    // Check if module already exists
    const existingModule = await this.repository.findModuleByName(dto.name);
    if (existingModule) {
      throw new ConflictException({
        code: 'MODULE_EXISTS',
        message: `Module '${dto.name}' already exists in metadata`,
      });
    }

    // 1. Create module record
    const module = await this.repository.createModule({
      name: dto.name,
      display_name: dto.displayName,
      description: dto.description,
      has_tenant_isolation: dto.hasTenantIsolation,
      has_soft_delete: dto.hasSoftDelete,
      has_audit: dto.hasAudit,
      generated_files: dto.generatedFiles,
      cli_command: dto.cliCommand,
      generator_version: dto.generatorVersion,
      is_active: true,
      created_by: dto.createdBy,
    });

    // 2. Create fields with validations
    if (dto.fields && dto.fields.length > 0) {
      for (const fieldDto of dto.fields) {
        const field = await this.repository.createField({
          module_id: module.id,
          name: fieldDto.name,
          display_name: fieldDto.displayName,
          description: fieldDto.description,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          field_type: fieldDto.fieldType as any,
          is_required: fieldDto.isRequired,
          is_unique: fieldDto.isUnique,
          is_nullable: fieldDto.isNullable,
          default_value: fieldDto.defaultValue,
          length: fieldDto.length,
          precision: fieldDto.precision,
          scale: fieldDto.scale,
          enum_values: fieldDto.enumValues,
          relation_module: fieldDto.relationModule,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          relation_type: fieldDto.relationType as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          input_type: fieldDto.inputType as any,
          placeholder: fieldDto.placeholder,
          help_text: fieldDto.helpText,
          is_searchable: fieldDto.isSearchable,
          is_sortable: fieldDto.isSortable,
          is_filterable: fieldDto.isFilterable,
          show_in_list: fieldDto.showInList,
          show_in_detail: fieldDto.showInDetail,
          show_in_form: fieldDto.showInForm,
          order: fieldDto.order,
        });

        // 3. Create validations for this field
        if (fieldDto.validations && fieldDto.validations.length > 0) {
          const validations = fieldDto.validations.map((valDto) => ({
            field_id: field.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            validation_type: valDto.validationType as any,
            validation_params: valDto.validationParams,
            error_message: valDto.errorMessage,
            order: valDto.order,
          }));

          await this.repository.createValidations(validations);
        }
      }
    }

    // 4. Record generation history
    await this.recordGeneration({
      operation: 'generate',
      moduleId: module.id,
      command: dto.cliCommand,
      options: {
        tenant: dto.hasTenantIsolation,
        softDelete: dto.hasSoftDelete,
        audit: dto.hasAudit,
        fieldsCount: dto.fields.length,
      },
      success: true,
      filesCreated: dto.generatedFiles,
      canRollback: true,
      createdBy: dto.createdBy,
    });

    return module;
  }

  /**
   * Record CLI operation in history
   */
  async recordGeneration(dto: RecordGenerationDto): Promise<GenerationHistory> {
    return this.repository.createHistory({
      operation: dto.operation,
      module_id: dto.moduleId,
      command: dto.command,
      options: dto.options,
      success: dto.success,
      error_message: dto.errorMessage,
      files_created: dto.filesCreated,
      files_modified: dto.filesModified,
      files_deleted: dto.filesDeleted,
      can_rollback: dto.canRollback ?? true,
      rollback_data: dto.rollbackData,
      created_by: dto.createdBy,
    });
  }

  // ============================================================================
  // QUERY OPERATIONS
  // ============================================================================

  /**
   * Get all modules
   */
  async getAllModules(includeDeleted = false): Promise<GeneratedModule[]> {
    return this.repository.findAllModules(includeDeleted);
  }

  /**
   * Get module by name
   */
  async getModuleByName(name: string): Promise<GeneratedModule> {
    const module = await this.repository.findModuleByName(name);
    if (!module) {
      throw new NotFoundException({
        code: 'MODULE_NOT_FOUND',
        message: `Module '${name}' not found in metadata`,
      });
    }
    return module;
  }

  /**
   * Get module with fields and validations
   */
  async getModuleWithFields(name: string): Promise<ModuleWithFields> {
    const module = await this.repository.findModuleWithFields(name);
    if (!module) {
      throw new NotFoundException({
        code: 'MODULE_NOT_FOUND',
        message: `Module '${name}' not found in metadata`,
      });
    }
    return module;
  }

  /**
   * Get module fields
   */
  async getModuleFields(moduleName: string): Promise<ModuleField[]> {
    const module = await this.getModuleByName(moduleName);
    return this.repository.findFieldsByModuleId(module.id);
  }

  /**
   * Get field validations
   */
  async getFieldValidations(fieldId: number): Promise<FieldValidation[]> {
    return this.repository.findValidationsByFieldId(fieldId);
  }

  /**
   * Get generation history
   */
  async getHistory(limit = 20): Promise<GenerationHistory[]> {
    return this.repository.findRecentHistory(limit);
  }

  /**
   * Get history by module
   */
  async getHistoryByModule(moduleName: string): Promise<GenerationHistory[]> {
    const module = await this.getModuleByName(moduleName);
    return this.repository.findHistoryByModuleId(module.id);
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    totalModules: number;
    activeModules: number;
    deletedModules: number;
    totalOperations: number;
    successfulOperations: number;
  }> {
    const totalModules = await this.repository.countModules(false);
    const activeModules = await this.repository.countModules(true);
    const totalOperations = await this.repository.countHistory(false);
    const successfulOperations = await this.repository.countHistory(true);

    return {
      totalModules,
      activeModules,
      deletedModules: totalModules - activeModules,
      totalOperations,
      successfulOperations,
    };
  }

  // ============================================================================
  // DELETE & RESTORE OPERATIONS
  // ============================================================================

  /**
   * Soft delete module
   */
  async deleteModule(
    moduleName: string,
    deletedBy?: number,
  ): Promise<{ module: GeneratedModule; history: GenerationHistory }> {
    const module = await this.getModuleByName(moduleName);

    // Soft delete module
    await this.repository.softDeleteModule(module.id, deletedBy);

    // Record deletion history
    const history = await this.recordGeneration({
      operation: 'delete',
      moduleId: module.id,
      command: `cms delete module ${moduleName}`,
      success: true,
      filesDeleted: module.generated_files as string[],
      canRollback: true,
      rollbackData: {
        moduleId: module.id,
        files: module.generated_files,
      },
      createdBy: deletedBy,
    });

    return { module, history };
  }

  /**
   * Restore deleted module
   */
  async restoreModule(
    moduleName: string,
  ): Promise<{ module: GeneratedModule; history: GenerationHistory }> {
    // Find module (including deleted)
    const modules = await this.repository.findAllModules(true);
    const module = modules.find((m) => m.name === moduleName && !m.is_active);

    if (!module) {
      throw new NotFoundException({
        code: 'MODULE_NOT_FOUND',
        message: `Deleted module '${moduleName}' not found`,
      });
    }

    // Restore module
    await this.repository.restoreModule(module.id);

    // Record restore history
    const history = await this.recordGeneration({
      operation: 'update',
      moduleId: module.id,
      command: `cms restore module ${moduleName}`,
      success: true,
      filesCreated: module.generated_files as string[],
      canRollback: true,
    });

    const restoredModule = await this.repository.findModuleById(module.id);
    return { module: restoredModule!, history };
  }

  /**
   * Check if module exists
   */
  async moduleExists(name: string): Promise<boolean> {
    const module = await this.repository.findModuleByName(name);
    return module !== null;
  }
}
