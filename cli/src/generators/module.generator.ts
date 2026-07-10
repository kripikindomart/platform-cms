/**
 * Module Generator
 * Generates complete NestJS module structure
 */

import * as path from 'path';
import { BaseGenerator, GeneratedFile, GeneratorOptions } from './base.generator';
import { toKebabCase, toPascalCase, pluralize, singularize } from '../utils/string.utils';

export interface ModuleGeneratorOptions extends GeneratorOptions {
  tenant?: boolean;
  softDelete?: boolean;
  audit?: boolean;
  dir?: string;
}

export class ModuleGenerator extends BaseGenerator {
  /**
   * Generate complete module structure
   */
  async generate(name: string, options: ModuleGeneratorOptions = {}): Promise<void> {
    this.logStart('Module', name);

    try {
      // Prepare template data
      const data = this.prepareTemplateData(name, options);

      // Generate all files
      const files = await this.generateFiles(name, data, options);

      // Write files
      await this.writeFiles(files);

      // Log success
      this.logComplete(files.length);
      this.showNextSteps(name, options);
    } catch (error) {
      this.logError(error as Error);
      throw error;
    }
  }

  /**
   * Prepare template data with all variables
   */
  protected prepareTemplateData(
    name: string,
    options: ModuleGeneratorOptions,
  ): Record<string, unknown> {
    return {
      ...this.getTemplateData(name),
      tenant: options.tenant || false,
      softDelete: options.softDelete || false,
      audit: options.audit || false,
    };
  }

  /**
   * Generate all module files
   */
  protected async generateFiles(
    name: string,
    data: Record<string, unknown>,
    options: ModuleGeneratorOptions,
  ): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    
    // Detect workspace root - handles multiple scenarios:
    // 1. Running from cli/ directory (development)
    // 2. Running from workspace root (production/docker)
    // 3. Global CLI installation
    let workspaceRoot = this.options.outputPath || process.cwd();
    
    const fs = await import('fs/promises');
    
    // Strategy 1: Check if current directory is CLI package
    try {
      const packageJsonPath = path.join(workspaceRoot, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      if (packageJson.name === '@platform-cms/cli') {
        // We're in cli/ directory, go up to workspace root
        workspaceRoot = path.dirname(workspaceRoot);
      }
    } catch {
      // Not in CLI package or package.json doesn't exist
    }
    
    // Strategy 2: Verify backend/src/modules exists at detected workspace root
    // If not, try to find it by going up directories
    let backendPath = path.join(workspaceRoot, 'backend', 'src', 'modules');
    let maxAttempts = 3; // Don't go up more than 3 levels
    
    while (maxAttempts > 0) {
      try {
        await fs.access(path.join(workspaceRoot, 'backend', 'src'));
        // Found backend/src, this is the correct workspace root
        break;
      } catch {
        // backend/src doesn't exist, try parent directory
        const parentDir = path.dirname(workspaceRoot);
        if (parentDir === workspaceRoot) {
          // Can't go up anymore, we're at root
          break;
        }
        workspaceRoot = parentDir;
        backendPath = path.join(workspaceRoot, 'backend', 'src', 'modules');
        maxAttempts--;
      }
    }
    
    // Strategy 3: If still not found, create directory structure
    // This handles global CLI usage where user might be in any directory
    try {
      await fs.access(path.join(workspaceRoot, 'backend', 'src'));
    } catch {
      // backend/src doesn't exist - warn user
      console.log('\n⚠ Warning: backend/src directory not found at workspace root.');
      console.log(`  Detected workspace root: ${workspaceRoot}`);
      console.log('  Files will be generated at this location.');
      console.log('  If this is incorrect, use --dir option to specify the correct path.\n');
    }
    
    const baseDir = options.dir || path.join(workspaceRoot, 'backend', 'src', 'modules');
    const moduleName = toKebabCase(pluralize(name));

    // 1. Module file
    files.push({
      path: path.join(baseDir, moduleName, `${moduleName}.module.ts`),
      content: await this.renderTemplate('backend/module/module.hbs', data),
    });

    // 2. Controller file
    files.push({
      path: path.join(baseDir, moduleName, `${moduleName}.controller.ts`),
      content: await this.renderTemplate('backend/module/controller.hbs', data),
    });

    // 3. Service file
    files.push({
      path: path.join(baseDir, moduleName, `${moduleName}.service.ts`),
      content: await this.renderTemplate('backend/module/service.hbs', data),
    });

    // 4. Repository file
    files.push({
      path: path.join(baseDir, moduleName, `${moduleName}.repository.ts`),
      content: await this.renderTemplate('backend/module/repository.hbs', data),
    });

    // 5. Entity file
    const entityName = toKebabCase(singularize(name));
    files.push({
      path: path.join(baseDir, moduleName, 'entities', `${entityName}.entity.ts`),
      content: await this.renderTemplate('backend/module/entities/entity.hbs', data),
    });

    // 6. Create DTO
    files.push({
      path: path.join(baseDir, moduleName, 'dto', `create-${entityName}.dto.ts`),
      content: await this.renderTemplate('backend/module/dto/create.hbs', data),
    });

    // 7. Update DTO
    files.push({
      path: path.join(baseDir, moduleName, 'dto', `update-${entityName}.dto.ts`),
      content: await this.renderTemplate('backend/module/dto/update.hbs', data),
    });

    // 8. Response DTO
    files.push({
      path: path.join(baseDir, moduleName, 'dto', `${entityName}-response.dto.ts`),
      content: await this.renderTemplate('backend/module/dto/response.hbs', data),
    });

    return files;
  }

  /**
   * Show next steps after generation
   */
  private showNextSteps(name: string, options: ModuleGeneratorOptions): void {
    const moduleName = toPascalCase(pluralize(name));

    console.log('\nNext steps:');
    console.log(`  1. Add ${moduleName}Module to app.module.ts imports`);
    console.log(`  2. Define fields in entities/${toKebabCase(singularize(name))}.entity.ts`);
    console.log(`  3. Add validation rules in DTOs`);
    console.log(`  4. Implement business logic in ${toKebabCase(pluralize(name))}.service.ts`);

    if (options.tenant) {
      console.log(`  5. Ensure TenantContextService is set in requests`);
    }

    if (options.audit) {
      console.log(`  6. Review audit logging in service methods`);
    }
  }
}
