/**
 * Interactive CLI Utilities
 * Helpers for interactive prompts and validation
 */

import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Field types yang didukung
 */
export const FIELD_TYPES = [
  'string',
  'text',
  'number',
  'integer',
  'float',
  'decimal',
  'boolean',
  'date',
  'datetime',
  'timestamp',
  'email',
  'url',
  'uuid',
  'json',
  'enum',
] as const;

export type FieldType = typeof FIELD_TYPES[number];

/**
 * Field definition result
 */
export interface FieldDefinition {
  name: string;
  type: FieldType;
  length?: number;
  precision?: number;
  scale?: number;
  required?: boolean;
  unique?: boolean;
  defaultValue?: string;
  enumValues?: string[];
}

/**
 * Interactive CRUD generation options
 */
export interface InteractiveCrudOptions {
  name: string;
  fields: string[];
  tenant: boolean;
  softDelete: boolean;
  audit: boolean;
  searchable?: string;
  filterable?: string;
  sortable?: string;
}

/**
 * Collect basic module information
 */
export async function collectBasicInfo(): Promise<Partial<InteractiveCrudOptions>> {
  console.log(chalk.cyan.bold('\n📦 Module Information\n'));

  return inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Module name (singular):',
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Module name is required';
        }
        if (!/^[a-z][a-z0-9-]*$/i.test(input)) {
          return 'Module name must start with a letter and contain only letters, numbers, and hyphens';
        }
        return true;
      },
    },
    {
      type: 'confirm',
      name: 'tenant',
      message: 'Enable tenant isolation?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'softDelete',
      message: 'Enable soft delete?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'audit',
      message: 'Enable audit logging?',
      default: true,
    },
  ]);
}

/**
 * Collect fields interactively
 */
export async function collectFields(): Promise<string[]> {
  console.log(chalk.cyan.bold('\n🔧 Field Definitions\n'));
  console.log(chalk.gray('Format: name:type[:length][:precision:scale]'));
  console.log(chalk.gray('Example: name:string:255, price:decimal:10:2, active:boolean'));
  console.log(chalk.gray('Press Enter with empty input to finish\n'));

  const fields: string[] = [];
  let fieldNumber = 1;

  while (true) {
    const { fieldInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'fieldInput',
        message: `Field ${fieldNumber} (or Enter to finish):`,
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return true; // Empty is valid (means finish)
          }

          // Basic validation
          const parts = input.split(':');
          if (parts.length < 2) {
            return 'Invalid format. Use: name:type[:length]';
          }

          const [name, type] = parts;
          
          if (!/^[a-z][a-z0-9_]*$/i.test(name)) {
            return 'Field name must start with a letter and contain only letters, numbers, and underscores';
          }

          if (!FIELD_TYPES.includes(type as FieldType)) {
            return `Invalid field type. Supported: ${FIELD_TYPES.join(', ')}`;
          }

          return true;
        },
      },
    ]);

    if (!fieldInput || fieldInput.trim().length === 0) {
      break;
    }

    fields.push(fieldInput.trim());
    fieldNumber++;
  }

  if (fields.length === 0) {
    console.log(chalk.yellow('\n⚠ No fields defined. Adding default "name" field.'));
    fields.push('name:string:255');
  }

  return fields;
}

/**
 * Collect query options (searchable, filterable, sortable)
 */
export async function collectQueryOptions(fields: string[]): Promise<{
  searchable?: string;
  filterable?: string;
  sortable?: string;
}> {
  console.log(chalk.cyan.bold('\n🔍 Query Options\n'));
  console.log(chalk.gray('Available fields:'), fields.map((f) => f.split(':')[0]).join(', '));
  console.log(chalk.gray('Enter field names separated by commas\n'));

  return inquirer.prompt([
    {
      type: 'input',
      name: 'searchable',
      message: 'Searchable fields (comma separated):',
      default: '',
      filter: (input: string) => input.trim() || undefined,
    },
    {
      type: 'input',
      name: 'filterable',
      message: 'Filterable fields (comma separated):',
      default: '',
      filter: (input: string) => input.trim() || undefined,
    },
    {
      type: 'input',
      name: 'sortable',
      message: 'Sortable fields (comma separated):',
      default: '',
      filter: (input: string) => input.trim() || undefined,
    },
  ]);
}

/**
 * Display summary before generation
 */
export function displaySummary(options: InteractiveCrudOptions): void {
  console.log(chalk.cyan.bold('\n📋 Generation Summary\n'));
  console.log(chalk.gray('Module:'), chalk.white(options.name));
  console.log(chalk.gray('Tenant Isolation:'), options.tenant ? chalk.green('✓') : chalk.red('✗'));
  console.log(chalk.gray('Soft Delete:'), options.softDelete ? chalk.green('✓') : chalk.red('✗'));
  console.log(chalk.gray('Audit Logging:'), options.audit ? chalk.green('✓') : chalk.red('✗'));
  console.log(chalk.gray('Fields:'), chalk.white(`${options.fields.length} field(s)`));
  
  options.fields.forEach((field, index) => {
    console.log(chalk.gray(`  ${index + 1}.`), chalk.white(field));
  });

  if (options.searchable) {
    console.log(chalk.gray('Searchable:'), chalk.white(options.searchable));
  }
  if (options.filterable) {
    console.log(chalk.gray('Filterable:'), chalk.white(options.filterable));
  }
  if (options.sortable) {
    console.log(chalk.gray('Sortable:'), chalk.white(options.sortable));
  }
  console.log();
}

/**
 * Confirm before generation
 */
export async function confirmGeneration(): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Generate module with these settings?',
      default: true,
    },
  ]);

  return confirm;
}

/**
 * Main interactive flow
 */
export async function interactiveCrudGeneration(): Promise<InteractiveCrudOptions | null> {
  try {
    // Step 1: Basic info
    const basicInfo = await collectBasicInfo();

    // Step 2: Fields
    const fields = await collectFields();

    // Step 3: Query options
    const queryOptions = await collectQueryOptions(fields);

    // Combine all options
    const options: InteractiveCrudOptions = {
      name: basicInfo.name!,
      tenant: basicInfo.tenant!,
      softDelete: basicInfo.softDelete!,
      audit: basicInfo.audit!,
      fields,
      ...queryOptions,
    };

    // Step 4: Display summary
    displaySummary(options);

    // Step 5: Confirm
    const confirmed = await confirmGeneration();

    if (!confirmed) {
      console.log(chalk.yellow('\n✗ Generation cancelled\n'));
      return null;
    }

    return options;
  } catch (error: any) {
    if (error.isTtyError) {
      console.error(chalk.red('\n✗ Interactive mode not supported in this environment\n'));
    } else if (error.message && error.message.includes('User force closed')) {
      console.log(chalk.yellow('\n✗ Generation cancelled by user\n'));
    } else {
      console.error(chalk.red('\n✗ Error:'), error.message);
    }
    return null;
  }
}
