/**
 * Template utility functions for CLI
 * Handles Handlebars template rendering
 */

import * as Handlebars from 'handlebars';
import * as path from 'path';
import { readFile } from './file.utils';
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  pluralize,
  singularize,
  capitalize,
  uncapitalize,
} from './string.utils';

/**
 * Register Handlebars helpers
 */
function registerHelpers(): void {
  // Case conversion helpers
  Handlebars.registerHelper('PascalCase', (str: string) => toPascalCase(str));
  Handlebars.registerHelper('camelCase', (str: string) => toCamelCase(str));
  Handlebars.registerHelper('kebab-case', (str: string) => toKebabCase(str));
  Handlebars.registerHelper('snake_case', (str: string) => toSnakeCase(str));

  // Pluralization helpers
  Handlebars.registerHelper('pluralize', (str: string) => pluralize(str));
  Handlebars.registerHelper('singularize', (str: string) => singularize(str));

  // String helpers
  Handlebars.registerHelper('capitalize', (str: string) => capitalize(str));
  Handlebars.registerHelper('uncapitalize', (str: string) => uncapitalize(str));
  Handlebars.registerHelper('uppercase', (str: string) => str.toUpperCase());
  Handlebars.registerHelper('lowercase', (str: string) => str.toLowerCase());

  // Conditional helpers
  Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
  Handlebars.registerHelper('ne', (a: unknown, b: unknown) => a !== b);
  Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
  Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
  Handlebars.registerHelper('and', (...args: unknown[]) => {
    args.pop(); // Remove Handlebars options object
    return args.every(Boolean);
  });
  Handlebars.registerHelper('or', (...args: unknown[]) => {
    args.pop(); // Remove Handlebars options object
    return args.some(Boolean);
  });
}

// Register helpers on module load
registerHelpers();

/**
 * Render template with data
 */
export async function renderTemplate(
  templatePath: string,
  data: Record<string, unknown>,
): Promise<string> {
  // Get template directory (relative to CLI package)
  const templatesDir = path.join(__dirname, '../../templates');
  const fullPath = path.join(templatesDir, templatePath);

  // Read template file
  const templateContent = await readFile(fullPath);

  // Compile template
  const template = Handlebars.compile(templateContent);

  // Render with data
  return template(data);
}

/**
 * Render template from string
 */
export function renderTemplateString(
  templateString: string,
  data: Record<string, unknown>,
): string {
  const template = Handlebars.compile(templateString);
  return template(data);
}

/**
 * Register custom partial
 */
export function registerPartial(name: string, content: string): void {
  Handlebars.registerPartial(name, content);
}

/**
 * Register custom helper
 */
export function registerHelper(
  name: string,
  fn: Handlebars.HelperDelegate,
): void {
  Handlebars.registerHelper(name, fn);
}
