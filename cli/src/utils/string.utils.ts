/**
 * String utility functions for CLI
 * Handles case conversions and pluralization
 */

/**
 * Convert string to PascalCase
 * Examples:
 * - user-role -> UserRole
 * - user_role -> UserRole
 * - userRole -> UserRole
 */
export function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Convert string to camelCase
 * Examples:
 * - user-role -> userRole
 * - UserRole -> userRole
 * - user_role -> userRole
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert string to kebab-case
 * Examples:
 * - UserRole -> user-role
 * - user_role -> user-role
 * - userRole -> user-role
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to snake_case
 * Examples:
 * - UserRole -> user_role
 * - user-role -> user_role
 * - userRole -> user_role
 */
export function toSnakeCase(str: string): string {
  return toKebabCase(str).replace(/-/g, '_');
}

/**
 * Pluralize word (basic implementation)
 * Examples:
 * - user -> users
 * - category -> categories
 * - status -> statuses
 */
export function pluralize(word: string): string {
  if (word.endsWith('y') && !['ay', 'ey', 'iy', 'oy', 'uy'].some(v => word.endsWith(v))) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('x') || word.endsWith('z') || 
      word.endsWith('ch') || word.endsWith('sh')) {
    return word + 'es';
  }
  return word + 's';
}

/**
 * Singularize word (basic implementation)
 * Examples:
 * - users -> user
 * - categories -> category
 * - statuses -> status
 */
export function singularize(word: string): string {
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('ses') || word.endsWith('xes') || word.endsWith('zes')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('ches') || word.endsWith('shes')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Capitalize first letter
 * Examples:
 * - hello -> Hello
 * - world -> World
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Lowercase first letter
 * Examples:
 * - Hello -> hello
 * - World -> world
 */
export function uncapitalize(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
