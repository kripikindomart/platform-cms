 import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { ModuleMetadataRepository } from './module-metadata.repository';
import { CodeGenerationService } from './services/code-generation.service';
import { GenerateModuleDto } from './dto/generate-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { QueryModulesDto } from './dto/query-modules.dto';
import { TenantContextService } from '../../common/context/tenant-context.service';
import { TenantsRepository } from '../tenants/tenants.repository';

/**
 * Module Generator Service
 * Handles business logic untuk CRUD Builder UI
 * 
 * Service ini akan:
 * - Manage module metadata (CRUD operations)
 * - Generate module files (Phase 2)
 * - Handle validation dan business rules
 */
@Injectable()
export class ModuleGeneratorService {
  private readonly logger = new Logger(ModuleGeneratorService.name);

  constructor(
    private readonly repository: ModuleMetadataRepository,
    private readonly codeGenerationService: CodeGenerationService,
    private readonly tenantContext: TenantContextService,
    private readonly tenantsRepository: TenantsRepository,
  ) {}

  /**
   * Find all generated modules dengan pagination
   */
  async findAll(query: QueryModulesDto): Promise<any> {
    return this.repository.findAll(query);
  }

  /**
   * Find module by ID dengan fields
   */
  async findById(id: number): Promise<any> {
    const module = await this.repository.findById(id);
    
    if (!module) {
      throw new NotFoundException(`Module dengan ID ${id} tidak ditemukan`);
    }

    // Load fields
    const fields = await this.repository.getFields(id);
    
    return {
      ...module,
      fields: fields.map(f => ({
        name: f.fieldName,
        label: f.fieldLabel,
        type: f.fieldType,
        length: f.fieldLength,
        precision: f.precision,
        scale: f.scale,
        isVisibleInList: f.isVisibleInList,
        defaultValue: f.defaultValue,
        order: f.fieldOrder,
      })),
    };
  }

  /**
   * Create module schema (Step 1: Schema Builder - Table Definition)
   * 
   * Process:
   * 1. Validate module name uniqueness
   * 2. Save schema to visual_modules (public schema)
   * 3. Save fields to visual_module_fields
   * 4. Set status = 'draft'
   * 
   * Next steps:
   * - Step 2: Form Builder (configure UI/UX)
   * - Step 3: Assign to tenants (generate code)
   */
  async create(dto: GenerateModuleDto, userId: number): Promise<any> {
    this.logger.log(`Creating module schema: ${dto.moduleName}`);

    try {
      // Step 1: Validate uniqueness
      const exists = await this.repository.existsByName(dto.moduleName);
      if (exists) {
        throw new ConflictException(`Module '${dto.moduleName}' sudah ada`);
      }

      // Step 2: Save metadata to visual_modules (public schema - global)
      const metadata = {
        moduleName: dto.moduleName,
        displayName: dto.displayName,
        description: dto.description,
        isTenantIsolated: dto.isTenantIsolated,
        hasSoftDelete: dto.hasSoftDelete,
        hasAudit: dto.hasAudit,
        searchableFields: dto.searchableFields,
        filterableFields: dto.filterableFields,
        sortableFields: dto.sortableFields,
        fieldsCount: dto.fields.length,
        status: 'draft', // Draft status - needs form builder next
        createdBy: userId,
        updatedBy: userId,
      };

      const savedModule = await this.repository.create(metadata as any);

      // Step 3: Save fields to visual_module_fields
      await this.repository.saveFields(savedModule.id, dto.fields);

      this.logger.log(`Module schema '${dto.moduleName}' created successfully as draft`);

      return {
        success: true,
        message: `Schema berhasil disimpan! Lanjutkan ke Form Builder.`,
        data: {
          id: savedModule.id,
          moduleName: dto.moduleName,
          displayName: dto.displayName,
          status: 'draft',
          fieldsCount: dto.fields.length,
          nextStep: 'form_builder', // Indicate next step
        },
      };
    } catch (error: any) {
      this.logger.error(`Module schema creation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Assign module to CURRENT tenant (auto-detect from context)
   * Wrapper method that gets tenant from TenantContextService
   */
  async assignToCurrentTenant(moduleId: number, userId: number): Promise<any> {
    // Get current tenant from context
    const tenant = this.tenantContext.getTenant();
    
    if (!tenant) {
      throw new NotFoundException('Tenant context not found. Please access via tenant portal.');
    }
    
    this.logger.log(`Assigning module ${moduleId} to current tenant: ${tenant.slug} (ID: ${tenant.id})`);
    
    // Call the main assign method
    return this.assignToTenant(moduleId, tenant.id, userId);
  }

  /**
   * Assign module to specific tenant (Generate code)
   * 
   * Process:
   * 1. Validate module exists
   * 2. Check if already assigned to tenant
   * 3. Generate code files (12 files)
   * 4. Execute migration (create table)
   * 5. Create permissions (4 permissions)
   * 6. Create menu item
   * 7. Record assignment
   * 8. Rollback on any failure
   */
  async assignToTenant(moduleId: number, tenantId: number, userId: number, moduleDto?: GenerateModuleDto): Promise<any> {
    const startTime = Date.now();
    this.logger.log(`Assigning module ${moduleId} to tenant ${tenantId}`);

    try {
      // Step 1: Get module schema (if not provided)
      let module: any;
      let generateDto: GenerateModuleDto;

      if (moduleDto) {
        // Use provided DTO (when called from create)
        generateDto = moduleDto;
      } else {
        // Load from database
        module = await this.repository.findById(moduleId);
        if (!module) {
          throw new NotFoundException(`Module dengan ID ${moduleId} tidak ditemukan`);
        }

        // Load fields from visual_module_fields
        const fields = await this.repository.getFields(moduleId);

        // Build GenerateModuleDto from stored metadata
        generateDto = {
          moduleName: module.moduleName,
          displayName: module.displayName,
          description: module.description || undefined,
          isTenantIsolated: module.isTenantIsolated,
          hasSoftDelete: module.hasSoftDelete,
          hasAudit: module.hasAudit,
          searchableFields: module.searchableFields || [],
          filterableFields: module.filterableFields || [],
          sortableFields: module.sortableFields || [],
          fields: fields.map(f => ({
            name: f.fieldName,
            label: f.fieldLabel,
            type: f.fieldType,
            length: f.fieldLength,
            precision: f.precision,
            scale: f.scale,
            isRequired: false, // TODO: Add to schema
            isUnique: false, // TODO: Add to schema
            isVisibleInList: f.isVisibleInList,
            defaultValue: f.defaultValue,
            validations: [], // TODO: Load from form config
            order: f.fieldOrder,
          })),
        };
      }

      // Step 2: Check if already assigned
      // TODO: Check visual_module_installations table

      // Step 3: Get tenant schema
      const tenant = await this.tenantsRepository.findById(tenantId);
      if (!tenant) {
        throw new NotFoundException(`Tenant dengan ID ${tenantId} tidak ditemukan`);
      }
      const tenantSchema = tenant.schema_name;

      // Step 4: Generate code files
      this.logger.log(`Generating code files for module: ${generateDto.moduleName}`);
      const generationResult = await this.codeGenerationService.generateModule(
        generateDto, 
        tenantSchema,
        module?.uiConfig, // Pass UI config
        module?.fieldConfigurations, // Pass field configurations (NEW!)
      );

      if (!generationResult.success) {
        const errors = generationResult.errors?.join(', ') || 'Unknown error';
        throw new Error(`Code generation failed: ${errors}`);
      }

      this.logger.log(`Generated ${generationResult.filesCreated.length} files successfully`);

      // Step 5: Create permissions
      this.logger.log(`Creating permissions for module: ${generateDto.moduleName}`);
      const permissionsCreated = await this.codeGenerationService.createPermissions(
        generateDto.moduleName,
        tenantSchema,
      );

      // Step 6: Create menu item
      this.logger.log(`Creating menu item for module: ${generateDto.moduleName}`);
      const menuItemCreated = await this.codeGenerationService.createMenuItem(
        generateDto.moduleName,
        generateDto.displayName,
        tenantSchema,
      );

      // Step 7: Record assignment (which tenant has this module installed)
      await this.repository.recordInstallation(moduleId, tenantId, userId);

      const executionTime = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`Module '${generateDto.moduleName}' assigned to tenant ${tenantId} in ${executionTime}s`);

      return {
        success: true,
        message: `Module '${generateDto.moduleName}' berhasil di-assign ke tenant`,
        data: {
          moduleId: moduleId,
          moduleName: generateDto.moduleName,
          displayName: generateDto.displayName,
          tenantId,
          filesCreated: generationResult.filesCreated.length,
          permissionsCreated,
          menuItemCreated,
          files: generationResult.filesCreated,
        },
        meta: {
          assignmentTime: `${executionTime}s`,
        },
      };
    } catch (error: any) {
      this.logger.error(`Module assignment failed: ${error.message}`, error.stack);

      // Rollback: Delete generated files
      if (moduleDto) {
        try {
          await this.codeGenerationService.rollbackGeneration(moduleDto.moduleName);
          this.logger.log(`Rolled back generated files for module: ${moduleDto.moduleName}`);
        } catch (rollbackError: any) {
          this.logger.error(`Rollback failed: ${rollbackError.message}`);
        }
      }

      throw error;
    }
  }

  /**
   * Update module metadata
   * Note: Only metadata can be updated, not the generated code
   */
  async update(id: number, dto: UpdateModuleDto, userId: number): Promise<any> {
    const module = await this.repository.findById(id);
    
    if (!module) {
      throw new NotFoundException(`Module dengan ID ${id} tidak ditemukan`);
    }

    // Prepare uiConfig (convert to string if object)
    let uiConfigString: string | undefined;
    if (dto.uiConfig) {
      uiConfigString = typeof dto.uiConfig === 'string' 
        ? dto.uiConfig 
        : JSON.stringify(dto.uiConfig);
    }

    const updated = await this.repository.update(id, {
      ...dto,
      uiConfig: uiConfigString,
      updatedBy: userId,
    });

    return {
      success: true,
      message: `Module '${module.moduleName}' berhasil diupdate`,
      data: updated,
    };
  }

  /**
   * Delete module (HARD delete)
   * Deletes:
   * - Generated backend files (module folder)
   * - Generated frontend files (pages)
   * - Schema file
   * - Database record (hard delete)
   * 
   * TODO: Also delete permissions, menu items, and drop table
   */
  async delete(id: number, userId: number): Promise<any> {
    const module = await this.repository.findById(id);
    
    if (!module) {
      throw new NotFoundException(`Module dengan ID ${id} tidak ditemukan`);
    }

    this.logger.log(`Deleting module: ${module.moduleName} (ID: ${id})`);

    // Step 1: Delete generated files
    try {
      await this.codeGenerationService.rollbackGeneration(module.moduleName);
      this.logger.log(`✓ Deleted generated files for module: ${module.moduleName}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete files: ${error.message}`);
      // Continue even if file deletion fails
    }

    // Step 2: Hard delete from database
    await this.repository.hardDelete(id);
    this.logger.log(`✓ Hard deleted module from database: ${module.moduleName}`);

    return {
      success: true,
      message: `Module '${module.moduleName}' berhasil dihapus`,
      data: {
        moduleName: module.moduleName,
        filesDeleted: true,
        databaseDeleted: true,
        permissionsDeleted: false, // TODO: Implement
        menuItemDeleted: false, // TODO: Implement
        tableDropped: false, // TODO: Implement manual drop
      },
    };
  }

  /**
   * Validate module name availability
   */
  async validateModuleName(name: string): Promise<any> {
    const exists = await this.repository.existsByName(name);
    
    return {
      success: true,
      available: !exists,
      message: exists 
        ? `Module name '${name}' sudah digunakan`
        : `Module name '${name}' tersedia`,
    };
  }

  /**
   * Get all validation types
   */
  async getValidationTypes(): Promise<any> {
    const types = await this.repository.getValidationTypes();
    return {
      success: true,
      data: types,
    };
  }

  /**
   * Get validation types for specific field type
   */
  async getValidationTypesForFieldType(fieldType: string): Promise<any> {
    const types = await this.repository.getValidationTypesForFieldType(fieldType);
    return {
      success: true,
      data: types,
    };
  }
}
