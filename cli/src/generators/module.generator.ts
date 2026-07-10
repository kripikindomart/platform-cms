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
    const baseDir = options.dir || 'backend/src/modules';
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
