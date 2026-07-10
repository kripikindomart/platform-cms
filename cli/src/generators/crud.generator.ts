/**
 * CRUD Generator
 * Extends Module Generator with field definitions
 */

import { ModuleGenerator, ModuleGeneratorOptions } from './module.generator';
import { logger } from '../utils/logger.utils';

export interface Field {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  length?: number;
}

export interface CrudGeneratorOptions extends ModuleGeneratorOptions {
  fields?: string;
}

export class CrudGenerator extends ModuleGenerator {
  /**
   * Generate complete CRUD with fields
   */
  async generate(name: string, options: CrudGeneratorOptions = {}): Promise<void> {
    this.logStart('CRUD', name);

    try {
      // Parse fields
      const fields = this.parseFields(options.fields || '');

      // Prepare template data with fields
      const data = {
        ...this.prepareTemplateData(name, options),
        fields,
        hasFields: fields.length > 0,
      };

      // Generate all files using parent method
      const files = await this.generateFiles(name, data, options);

      // Write files
      await this.writeFiles(files);

      // Log success
      this.logComplete(files.length);
      this.showCrudNextSteps(name, options, fields);
    } catch (error) {
      this.logError(error as Error);
      throw error;
    }
  }

  /**
   * Parse fields string into Field array
   * Format: "name:string,email:email,age:number,active:boolean"
   */
  private parseFields(fieldsStr: string): Field[] {
    if (!fieldsStr) return [];

    return fieldsStr.split(',').map((fieldStr) => {
      const [name, typeWithModifiers] = fieldStr.trim().split(':');
      
      // Parse type and modifiers (e.g., "string:255" or "string!")
      let type = typeWithModifiers;
      let required = false;
      let unique = false;
      let length: number | undefined;

      // Check for required modifier (!)
      if (type.endsWith('!')) {
        required = true;
        type = type.slice(0, -1);
      }

      // Check for unique modifier (@)
      if (type.endsWith('@')) {
        unique = true;
        type = type.slice(0, -1);
      }

      // Check for length modifier (e.g., "string:255")
      const lengthMatch = type.match(/^(\w+):(\d+)$/);
      if (lengthMatch) {
        type = lengthMatch[1];
        length = parseInt(lengthMatch[2], 10);
      }

      return {
        name: name.trim(),
        type: this.normalizeType(type.trim()),
        required,
        unique,
        length,
      };
    });
  }

  /**
   * Normalize field type
   */
  private normalizeType(type: string): string {
    const typeMap: Record<string, string> = {
      string: 'string',
      text: 'text',
      number: 'number',
      int: 'number',
      integer: 'number',
      float: 'number',
      decimal: 'number',
      boolean: 'boolean',
      bool: 'boolean',
      date: 'date',
      datetime: 'datetime',
      timestamp: 'timestamp',
      email: 'email',
      url: 'url',
      uuid: 'uuid',
      json: 'json',
    };

    return typeMap[type.toLowerCase()] || 'string';
  }

  /**
   * Show CRUD-specific next steps
   */
  private showCrudNextSteps(
    name: string,
    options: CrudGeneratorOptions,
    fields: Field[],
  ): void {
    console.log('\nNext steps:');
    console.log(`  1. Add ${this.toPascalCase(this.pluralize(name))}Module to app.module.ts imports`);
    
    if (fields.length > 0) {
      console.log(`  2. Review generated fields (${fields.length} fields added)`);
      console.log(`  3. Add additional validation rules in DTOs if needed`);
    } else {
      console.log(`  2. Define fields in entities/${this.toKebabCase(this.singularize(name))}.entity.ts`);
      console.log(`  3. Add validation rules in DTOs`);
    }

    console.log(`  4. Test endpoints with Swagger UI at /api-docs`);

    if (options.tenant) {
      console.log(`  5. Ensure TenantContextService is set in requests`);
    }
  }

  // Helper methods (imported from string utils)
  private toPascalCase(str: string): string {
    return str.split(/[-_\s]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  }

  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
  }

  private pluralize(word: string): string {
    if (word.endsWith('s') && !word.endsWith('ss')) return word;
    if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
    return word + 's';
  }

  private singularize(word: string): string {
    if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }
}
