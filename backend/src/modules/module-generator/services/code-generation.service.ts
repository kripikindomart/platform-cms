import { Injectable, Logger, Inject } from '@nestjs/common';
import { GenerateModuleDto } from '../dto/generate-module.dto';
import { TemplateService } from './template.service';
import { FileSystemService } from './filesystem.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as path from 'path';

export interface GenerationContext {
  moduleName: string; // kebab-case (e.g., user-profile)
  displayName: string; // Human readable (e.g., User Profile)
  description?: string;
  className: string; // PascalCase (e.g., UserProfile)
  tableName: string; // snake_case (e.g., user_profiles)
  isTenantIsolated: boolean;
  hasSoftDelete: boolean;
  hasAudit: boolean;
  fields: FieldContext[];
  searchableFields: string[];
  filterableFields: string[];
  sortableFields: string[];
  tenantSchema: string;
  uiConfig?: {
    createFormType?: 'page' | 'modal';
    editFormType?: 'page' | 'modal';
  };
}

export interface FieldContext {
  name: string; // snake_case
  camelCase: string; // camelCase for TypeScript
  label: string; // UI display label
  type: string;
  dbType: string; // PostgreSQL type
  tsType: string; // TypeScript type
  drizzleType: string; // Drizzle ORM type
  length?: number;
  precision?: number;
  scale?: number;
  isRequired: boolean;
  isUnique: boolean;
  isVisibleInList: boolean;
  defaultValue?: string;
  enumOptions?: string[];
  validations: any[];
}

export interface GenerationResult {
  success: boolean;
  filesCreated: string[];
  permissionsCreated: number;
  menuItemCreated: boolean;
  tableCreated: boolean;
  errors?: string[];
}

@Injectable()
export class CodeGenerationService {
  private readonly logger = new Logger(CodeGenerationService.name);

  constructor(
    private readonly templateService: TemplateService,
    private readonly fileSystemService: FileSystemService,
    @Inject('DRIZZLE') private readonly db: NodePgDatabase<any>,
  ) {}

  /**
   * Generate all module files
   */
  async generateModule(
    dto: GenerateModuleDto,
    tenantSchema: string,
    uiConfig?: any,
  ): Promise<GenerationResult> {
    this.logger.log(`Generating module: ${dto.moduleName}`);

    const context = this.buildContext(dto, tenantSchema, uiConfig);
    const filesCreated: string[] = [];

    try {
      // 1. Generate Module file
      const moduleFile = await this.generateModuleFile(context);
      filesCreated.push(moduleFile);

      // 2. Generate Controller
      const controllerFile = await this.generateControllerFile(context);
      filesCreated.push(controllerFile);

      // 3. Generate Service
      const serviceFile = await this.generateServiceFile(context);
      filesCreated.push(serviceFile);

      // 4. Generate Repository
      const repositoryFile = await this.generateRepositoryFile(context);
      filesCreated.push(repositoryFile);

      // 5. Generate DTOs
      const dtoFiles = await this.generateDTOs(context);
      filesCreated.push(...dtoFiles);

      // 6. Generate Entity/Schema
      const entityFile = await this.generateEntityFile(context);
      filesCreated.push(entityFile);

      // 7. Generate Migration
      const migrationFile = await this.generateMigrationFile(context);
      filesCreated.push(migrationFile);

      // 8. Generate Frontend Pages
      const frontendFiles = await this.generateFrontendPages(context);
      filesCreated.push(...frontendFiles);

      this.logger.log(`Successfully generated ${filesCreated.length} files`);

      return {
        success: true,
        filesCreated,
        permissionsCreated: 0,
        menuItemCreated: false,
        tableCreated: false,
      };
    } catch (error: any) {
      this.logger.error(`Generation failed: ${error.message}`, error.stack);
      
      // Rollback: Delete created files
      await this.rollbackFiles(filesCreated);

      return {
        success: false,
        filesCreated: [],
        permissionsCreated: 0,
        menuItemCreated: false,
        tableCreated: false,
        errors: [error?.message || 'Unknown error'],
      };
    }
  }

  /**
   * Build template context from DTO
   */
  private buildContext(
    dto: GenerateModuleDto,
    tenantSchema: string,
    uiConfig?: any,
  ): GenerationContext {
    const className = this.toPascalCase(dto.moduleName);
    const tableName = this.toSnakeCase(dto.moduleName);

    // Parse uiConfig if it's a string
    let parsedUiConfig;
    if (uiConfig) {
      parsedUiConfig = typeof uiConfig === 'string' ? JSON.parse(uiConfig) : uiConfig;
    }

    return {
      moduleName: dto.moduleName,
      displayName: dto.displayName,
      description: dto.description,
      className,
      tableName,
      isTenantIsolated: dto.isTenantIsolated ?? true,
      hasSoftDelete: dto.hasSoftDelete ?? true,
      hasAudit: dto.hasAudit ?? true,
      fields: dto.fields.map((f) => this.buildFieldContext(f)),
      searchableFields: dto.searchableFields || [],
      filterableFields: dto.filterableFields || [],
      sortableFields: dto.sortableFields || [],
      tenantSchema,
      uiConfig: parsedUiConfig || {
        createFormType: 'page',
        editFormType: 'page',
      },
    };
  }

  /**
   * Build field context with type mappings
   */
  private buildFieldContext(field: any): FieldContext {
    const typeMapping = this.getTypeMapping(field.type);
    
    return {
      name: field.name,
      camelCase: this.toCamelCase(field.name),
      label: field.label || field.name,
      type: field.type,
      dbType: typeMapping.dbType,
      tsType: typeMapping.tsType,
      drizzleType: typeMapping.drizzleType,
      length: field.length,
      precision: field.precision,
      scale: field.scale,
      isRequired: field.isRequired ?? false,
      isUnique: field.isUnique ?? false,
      isVisibleInList: field.isVisibleInList ?? true,
      defaultValue: field.defaultValue,
      enumOptions: field.enumOptions,
      validations: field.validations || [],
    };
  }

  /**
   * Type mapping for different systems
   */
  private getTypeMapping(type: string): {
    dbType: string;
    tsType: string;
    drizzleType: string;
  } {
    const mappings: Record<string, any> = {
      // Types accepted by ModuleFieldDto.type
      string: { dbType: 'VARCHAR', tsType: 'string', drizzleType: 'varchar' },
      text: { dbType: 'TEXT', tsType: 'string', drizzleType: 'text' },
      number: { dbType: 'NUMERIC', tsType: 'number', drizzleType: 'numeric' },
      boolean: { dbType: 'BOOLEAN', tsType: 'boolean', drizzleType: 'boolean' },
      date: { dbType: 'DATE', tsType: 'string', drizzleType: 'date' },
      datetime: { dbType: 'TIMESTAMP', tsType: 'string', drizzleType: 'timestamp' },
      email: { dbType: 'VARCHAR', tsType: 'string', drizzleType: 'varchar' },
      url: { dbType: 'VARCHAR', tsType: 'string', drizzleType: 'varchar' },
      uuid: { dbType: 'UUID', tsType: 'string', drizzleType: 'uuid' },
      json: { dbType: 'JSONB', tsType: 'any', drizzleType: 'jsonb' },
      enum: { dbType: 'VARCHAR', tsType: 'string', drizzleType: 'varchar' },
      // Legacy aliases kept for backward compatibility
      integer: { dbType: 'INTEGER', tsType: 'number', drizzleType: 'integer' },
      bigint: { dbType: 'BIGINT', tsType: 'number', drizzleType: 'bigint' },
      decimal: { dbType: 'NUMERIC', tsType: 'number', drizzleType: 'numeric' },
      float: { dbType: 'REAL', tsType: 'number', drizzleType: 'real' },
    };

    return mappings[type] || mappings.string;
  }

  /**
   * Generate module.ts file
   */
  private async generateModuleFile(context: GenerationContext): Promise<string> {
    const content = await this.templateService.render('module.ts.hbs', context);
    const filePath = path.join('src', 'modules', context.moduleName, `${context.moduleName}.module.ts`);
    await this.fileSystemService.writeFile(filePath, content);
    return filePath;
  }

  /**
   * Generate controller.ts file
   */
  private async generateControllerFile(context: GenerationContext): Promise<string> {
    const content = await this.templateService.render('controller.ts.hbs', context);
    const filePath = path.join('src', 'modules', context.moduleName, `${context.moduleName}.controller.ts`);
    await this.fileSystemService.writeFile(filePath, content);
    return filePath;
  }

  /**
   * Generate service.ts file
   */
  private async generateServiceFile(context: GenerationContext): Promise<string> {
    const content = await this.templateService.render('service.ts.hbs', context);
    const filePath = path.join('src', 'modules', context.moduleName, `${context.moduleName}.service.ts`);
    await this.fileSystemService.writeFile(filePath, content);
    return filePath;
  }

  /**
   * Generate repository.ts file
   */
  private async generateRepositoryFile(context: GenerationContext): Promise<string> {
    const content = await this.templateService.render('repository.ts.hbs', context);
    const filePath = path.join('src', 'modules', context.moduleName, `${context.moduleName}.repository.ts`);
    await this.fileSystemService.writeFile(filePath, content);
    return filePath;
  }

  /**
   * Generate all DTO files
   */
  private async generateDTOs(context: GenerationContext): Promise<string[]> {
    const dtoFiles: string[] = [];
    const dtoTypes = ['create', 'update', 'query', 'response'];

    for (const type of dtoTypes) {
      const content = await this.templateService.render(`dto-${type}.ts.hbs`, context);
      const filePath = path.join('src', 'modules', context.moduleName, 'dto', `${type}-${context.moduleName}.dto.ts`);
      await this.fileSystemService.writeFile(filePath, content);
      dtoFiles.push(filePath);
    }

    return dtoFiles;
  }

  /**
   * Generate entity/schema file
   */
  private async generateEntityFile(context: GenerationContext): Promise<string> {
    const content = await this.templateService.render('entity.ts.hbs', context);
    const filePath = path.join('src', 'database', 'schema', 'tenant', `${context.tableName}.schema.ts`);
    await this.fileSystemService.writeFile(filePath, content);
    return filePath;
  }

  /**
   * Generate migration SQL file
   */
  private async generateMigrationFile(context: GenerationContext): Promise<string> {
    const content = await this.templateService.render('migration.sql.hbs', context);
    const timestamp = Date.now();
    const filePath = path.join('migrations', `${timestamp}-create-${context.tableName}.sql`);
    await this.fileSystemService.writeFile(filePath, content);
    return filePath;
  }

  /**
   * Generate all frontend pages
   * Generates modals or pages based on uiConfig
   */
  private async generateFrontendPages(context: GenerationContext): Promise<string[]> {
    const filesCreated: string[] = [];
    const frontendRoot = path.join('..', 'frontend');
    const portalBase = path.join(
      frontendRoot,
      'app',
      '(private)',
      'org',
      '[tenant]',
      'portal',
      context.moduleName,
    );

    const uiConfig = context.uiConfig || { createFormType: 'page', editFormType: 'page' };

    // 1. Frontend API service
    const serviceContent = await this.templateService.render('frontend/service.ts.hbs', context);
    const servicePath = path.join(frontendRoot, 'lib', 'api', 'services', `${context.moduleName}.service.ts`);
    await this.fileSystemService.writeFile(servicePath, serviceContent);
    filesCreated.push(servicePath);

    // 2. Data hook
    const hookContent = await this.templateService.render('frontend/hook.ts.hbs', context);
    const hookPath = path.join(frontendRoot, 'hooks', `use-${context.moduleName}.ts`);
    await this.fileSystemService.writeFile(hookPath, hookContent);
    filesCreated.push(hookPath);

    // 3. List page
    const listPageContent = await this.templateService.render('frontend/list-page.tsx.hbs', context);
    const listPagePath = path.join(portalBase, 'page.tsx');
    await this.fileSystemService.writeFile(listPagePath, listPageContent);
    filesCreated.push(listPagePath);

    // 4. Table component
    const tableContent = await this.templateService.render('frontend/table.tsx.hbs', context);
    const tablePath = path.join(portalBase, 'components', `${context.moduleName}-table.tsx`);
    await this.fileSystemService.writeFile(tablePath, tableContent);
    filesCreated.push(tablePath);

    // 5. Delete confirmation dialog
    const deleteDialogContent = await this.templateService.render('frontend/delete-dialog.tsx.hbs', context);
    const deleteDialogPath = path.join(portalBase, 'components', 'delete-dialog.tsx');
    await this.fileSystemService.writeFile(deleteDialogPath, deleteDialogContent);
    filesCreated.push(deleteDialogPath);

    // 6. Create form (modal or page)
    if (uiConfig.createFormType === 'modal') {
      const createModalContent = await this.templateService.render('frontend/create-modal.tsx.hbs', context);
      const createModalPath = path.join(portalBase, 'components', `create-${context.moduleName}-modal.tsx`);
      await this.fileSystemService.writeFile(createModalPath, createModalContent);
      filesCreated.push(createModalPath);
    } else {
      const createPageContent = await this.templateService.render('frontend/create-page.tsx.hbs', context);
      const createPagePath = path.join(portalBase, 'create', 'page.tsx');
      await this.fileSystemService.writeFile(createPagePath, createPageContent);
      filesCreated.push(createPagePath);
    }

    // 7. Edit form (modal or page)
    if (uiConfig.editFormType === 'modal') {
      const editModalContent = await this.templateService.render('frontend/edit-modal.tsx.hbs', context);
      const editModalPath = path.join(portalBase, 'components', `edit-${context.moduleName}-modal.tsx`);
      await this.fileSystemService.writeFile(editModalPath, editModalContent);
      filesCreated.push(editModalPath);
    } else {
      const editPageContent = await this.templateService.render('frontend/edit-page.tsx.hbs', context);
      const editPagePath = path.join(portalBase, '[id]', 'edit', 'page.tsx');
      await this.fileSystemService.writeFile(editPagePath, editPageContent);
      filesCreated.push(editPagePath);
    }

    this.logger.log(`Generated ${filesCreated.length} frontend files`);
    return filesCreated;
  }

  /**
   * Rollback generated files for a module (HARD DELETE)
   * Deletes:
   * - Backend module folder (src/modules/{moduleName})
   * - Frontend pages folder (frontend/app/(private)/org/[tenant]/portal/{moduleName})
   * - Schema file (src/database/schema/tenant/{tableName}.schema.ts)
   * - Migration files (migrations/*-create-{tableName}.sql)
   */
  async rollbackGeneration(moduleName: string): Promise<void> {
    this.logger.log(`Rolling back generated files for module: ${moduleName}`);
    const tableName = this.toSnakeCase(moduleName);

    const pathsToDelete = [
      // Backend module folder
      path.join('src', 'modules', moduleName),

      // Frontend pages folder
      path.join('..', 'frontend', 'app', '(private)', 'org', '[tenant]', 'portal', moduleName),

      // Frontend API service (lives outside the portal pages folder)
      path.join('..', 'frontend', 'lib', 'api', 'services', `${moduleName}.service.ts`),

      // Frontend data hook (lives outside the portal pages folder)
      path.join('..', 'frontend', 'hooks', `use-${moduleName}.ts`),

      // Schema file
      path.join('src', 'database', 'schema', 'tenant', `${tableName}.schema.ts`),
    ];

    // Delete directories and files
    for (const pathToDelete of pathsToDelete) {
      try {
        await this.fileSystemService.deleteDirectory(pathToDelete);
        this.logger.log(`✓ Deleted: ${pathToDelete}`);
      } catch (error: any) {
        this.logger.warn(`⚠ Could not delete ${pathToDelete}: ${error.message}`);
      }
    }

    // Delete migration files (may be multiple files with timestamps)
    try {
      const migrationsPath = path.join(this.fileSystemService['projectRoot'], 'migrations');
      const fs = await import('fs/promises');
      const files = await fs.readdir(migrationsPath);
      
      for (const file of files) {
        if (file.includes(`-create-${tableName}.sql`)) {
          const migrationPath = path.join('migrations', file);
          await this.fileSystemService.deleteFile(migrationPath);
          this.logger.log(`✓ Deleted migration: ${file}`);
        }
      }
    } catch (error: any) {
      this.logger.warn(`⚠ Could not delete migration files: ${error.message}`);
    }

    // Delete menu items (from all tenant schemas)
    try {
      await this.deleteMenuItems(moduleName);
      this.logger.log(`✓ Deleted menu items for module: ${moduleName}`);
    } catch (error: any) {
      this.logger.warn(`⚠ Could not delete menu items: ${error.message}`);
    }

    // Delete permissions (from all tenant schemas)
    try {
      await this.deletePermissions(moduleName);
      this.logger.log(`✓ Deleted permissions for module: ${moduleName}`);
    } catch (error: any) {
      this.logger.warn(`⚠ Could not delete permissions: ${error.message}`);
    }

    this.logger.log(`✓ Rollback completed for module: ${moduleName}`);
  }

  /**
   * Delete menu items for a module from all tenants
   */
  private async deleteMenuItems(moduleName: string): Promise<void> {
    // Get all tenant schemas
    const tenantSchemas = await this.getTenantSchemas();
    
    for (const schema of tenantSchemas) {
      try {
        await this.db.execute(sql.raw(`
          DELETE FROM ${schema}.menu_items 
          WHERE module_name = '${moduleName}'
        `));
        this.logger.log(`  ✓ Deleted menus from ${schema}`);
      } catch (error: any) {
        this.logger.warn(`  ⚠ Could not delete menus from ${schema}: ${error.message}`);
      }
    }
  }

  /**
   * Delete permissions for a module from all tenants
   */
  private async deletePermissions(moduleName: string): Promise<void> {
    // Permission actions: view_, create_, update_, delete_
    const permissionPrefixes = [
      `view_${moduleName}`,
      `create_${moduleName}`,
      `update_${moduleName}`,
      `delete_${moduleName}`,
    ];
    
    // Get all tenant schemas
    const tenantSchemas = await this.getTenantSchemas();
    
    for (const schema of tenantSchemas) {
      try {
        for (const permission of permissionPrefixes) {
          await this.db.execute(sql.raw(`
            DELETE FROM ${schema}.permissions 
            WHERE action = '${permission}'
          `));
        }
        this.logger.log(`  ✓ Deleted permissions from ${schema}`);
      } catch (error: any) {
        this.logger.warn(`  ⚠ Could not delete permissions from ${schema}: ${error.message}`);
      }
    }
  }

  /**
   * Get all tenant schemas from database
   */
  private async getTenantSchemas(): Promise<string[]> {
    try {
      const result = await this.db.execute(sql`
        SELECT slug 
        FROM public.tenants 
        WHERE deleted_at IS NULL
      `);
      
      // Convert slugs to schema names (tenant_{slug})
      return (result.rows as any[]).map((row: any) => `tenant_${row.slug}`);
    } catch (error: any) {
      this.logger.warn(`Could not fetch tenant schemas: ${error.message}`);
      return [];
    }
  }

  /**
   * Create permissions for module
   * Creates 4 standard CRUD permissions in tenant schema
   */
  async createPermissions(moduleName: string, tenantSchema: string): Promise<number> {
    this.logger.log(`Creating permissions for module: ${moduleName} (tenant: ${tenantSchema})`);
    
    const permissions = [
      {
        action: `view_${moduleName}`,
        resource: moduleName,
        description: `View ${moduleName} records`,
      },
      {
        action: `create_${moduleName}`,
        resource: moduleName,
        description: `Create new ${moduleName} records`,
      },
      {
        action: `update_${moduleName}`,
        resource: moduleName,
        description: `Update ${moduleName} records`,
      },
      {
        action: `delete_${moduleName}`,
        resource: moduleName,
        description: `Delete ${moduleName} records`,
      },
    ];

    try {
      // Check if permissions table exists
      const tableCheck = await this.db.execute(sql.raw(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = '${tenantSchema}' 
          AND table_name = 'permissions'
        )
      `));
      
      const tableExists = (tableCheck.rows[0] as any).exists;
      
      if (!tableExists) {
        this.logger.warn(`  ⚠ Permissions table does not exist in ${tenantSchema}, skipping...`);
        return 0;
      }
      
      for (const permission of permissions) {
        await this.db.execute(sql.raw(`
          INSERT INTO ${tenantSchema}.permissions (action, resource, description, created_at)
          VALUES ('${permission.action}', '${permission.resource}', '${permission.description}', NOW())
          ON CONFLICT (action) DO NOTHING
        `));
      }
      
      this.logger.log(`  ✓ Created ${permissions.length} permissions in ${tenantSchema}`);
      return permissions.length;
    } catch (error: any) {
      this.logger.warn(`  ⚠ Could not create permissions: ${error.message}`);
      return 0; // Don't throw, just skip
    }
  }

  /**
   * Create menu item for module
   * Adds menu item to "Main Menu" in tenant schema
   */
  async createMenuItem(moduleName: string, displayName: string, tenantSchema: string): Promise<boolean> {
    this.logger.log(`Creating menu item for module: ${moduleName} (tenant: ${tenantSchema})`);
    
    try {
      // Check if menu_items table exists
      const tableCheck = await this.db.execute(sql.raw(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = '${tenantSchema}' 
          AND table_name = 'menu_items'
        )
      `));
      
      const tableExists = (tableCheck.rows[0] as any).exists;
      
      if (!tableExists) {
        this.logger.warn(`  ⚠ Menu tables do not exist in ${tenantSchema}, skipping...`);
        return false;
      }
      
      // Get "Main Menu" ID (or create if doesn't exist)
      const menuResult = await this.db.execute(sql.raw(`
        INSERT INTO ${tenantSchema}.menus (name, slug, icon, "order", is_active, created_at, updated_at)
        VALUES ('Main Menu', 'main-menu', 'LayoutDashboard', 0, true, NOW(), NOW())
        ON CONFLICT (slug) DO UPDATE SET updated_at = NOW()
        RETURNING id
      `));
      
      const mainMenuId = (menuResult.rows[0] as any).id;
      
      // Insert menu item
      await this.db.execute(sql.raw(`
        INSERT INTO ${tenantSchema}.menu_items (
          menu_id, 
          module_name, 
          label, 
          url, 
          icon, 
          "order", 
          is_active,
          required_permission,
          created_at, 
          updated_at
        )
        VALUES (
          ${mainMenuId},
          '${moduleName}',
          '${displayName}',
          '/portal/${moduleName}',
          'FileText',
          999,
          true,
          'view_${moduleName}',
          NOW(),
          NOW()
        )
        ON CONFLICT (menu_id, module_name) DO UPDATE 
        SET label = '${displayName}', updated_at = NOW()
      `));
      
      this.logger.log(`  ✓ Created menu item '${displayName}' in ${tenantSchema}`);
      return true;
    } catch (error: any) {
      this.logger.warn(`  ⚠ Could not create menu item: ${error.message}`);
      return false; // Don't throw, just skip
    }
  }

  /**
   * Rollback files helper (used during generation failures)
   */
  private async rollbackFiles(filesCreated: string[]): Promise<void> {
    this.logger.log(`Rolling back ${filesCreated.length} created files`);
    
    for (const file of filesCreated) {
      try {
        await this.fileSystemService.deleteFile(file);
      } catch (error: any) {
        this.logger.warn(`Could not delete file ${file}: ${error.message}`);
      }
    }
  }

  // ===============================
  // Helper Methods (Case Conversion)
  // ===============================

  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private toSnakeCase(str: string): string {
    return str.replace(/-/g, '_').toLowerCase();
  }
}
