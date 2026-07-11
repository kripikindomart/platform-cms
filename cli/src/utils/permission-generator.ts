/**
 * Permission Generator Utility
 * Generates standard CRUD permissions for a module
 */

export interface PermissionDefinition {
  slug: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface PermissionSet {
  resource: string;
  permissions: PermissionDefinition[];
  sqlInsert: string;
}

/**
 * Generate standard CRUD permissions for a module
 */
export function generateModulePermissions(
  moduleName: string,
  displayName?: string,
): PermissionSet {
  const resource = moduleName.toLowerCase();
  const display = displayName || capitalizeFirst(moduleName);

  const actions = [
    { action: 'read', verb: 'View', description: `Can view ${resource}` },
    { action: 'create', verb: 'Create', description: `Can create ${resource}` },
    { action: 'update', verb: 'Update', description: `Can update ${resource}` },
    { action: 'delete', verb: 'Delete', description: `Can delete ${resource}` },
  ];

  const permissions: PermissionDefinition[] = actions.map((item) => ({
    slug: `${resource}.${item.action}`,
    name: `${item.verb} ${display}`,
    resource: resource,
    action: item.action,
    description: item.description,
  }));

  // Generate SQL INSERT statement
  const sqlValues = permissions
    .map(
      (p) =>
        `('${p.name}', '${p.slug}', '${p.resource}', '${p.action}', '${p.description}')`,
    )
    .join(',\n  ');

  const sqlInsert = `
-- Insert permissions for ${display} module
INSERT INTO permissions (name, slug, resource, action, description)
VALUES
  ${sqlValues}
ON CONFLICT (slug) DO NOTHING;
`.trim();

  return {
    resource,
    permissions,
    sqlInsert,
  };
}

/**
 * Generate permission check decorator code for controller
 */
export function generatePermissionDecorators(resource: string): {
  imports: string[];
  decorators: {
    create: string;
    read: string;
    update: string;
    delete: string;
  };
} {
  return {
    imports: [
      "import { CheckPolicies } from '../../common/decorators/check-policies.decorator';",
      "import { Action, Subjects } from '../../core/casl/casl-ability.factory';",
    ],
    decorators: {
      create: `@CheckPolicies((ability) => ability.can('create', '${resource}' as Subjects))`,
      read: `@CheckPolicies((ability) => ability.can('read', '${resource}' as Subjects))`,
      update: `@CheckPolicies((ability) => ability.can('update', '${resource}' as Subjects))`,
      delete: `@CheckPolicies((ability) => ability.can('delete', '${resource}' as Subjects))`,
    },
  };
}

/**
 * Generate migration file for permissions
 */
export function generatePermissionMigration(
  moduleName: string,
  permissions: PermissionDefinition[],
): string {
  const resource = moduleName.toLowerCase();
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const fileName = `${timestamp}_add_${resource}_permissions.sql`;

  const values = permissions
    .map(
      (p) =>
        `  ('${p.name}', '${p.slug}', '${p.resource}', '${p.action}', '${p.description}')`,
    )
    .join(',\n');

  const content = `-- Migration: Add ${moduleName} module permissions
-- Generated: ${new Date().toISOString()}

INSERT INTO permissions (name, slug, resource, action, description)
VALUES
${values}
ON CONFLICT (slug) DO NOTHING;

-- Optionally assign all permissions to administrator role
-- INSERT INTO role_permissions (role_id, permission_id)
-- SELECT r.id, p.id 
-- FROM roles r 
-- CROSS JOIN permissions p 
-- WHERE r.slug = 'administrator' AND p.resource = '${resource}'
-- ON CONFLICT DO NOTHING;
`;

  return content;
}

/**
 * Capitalize first letter of string
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate TypeScript enum for permissions
 */
export function generatePermissionEnum(
  moduleName: string,
  permissions: PermissionDefinition[],
): string {
  const enumName = `${capitalizeFirst(moduleName)}Permission`;
  const enumValues = permissions
    .map((p) => {
      const key = p.action.toUpperCase();
      return `  ${key} = '${p.slug}',`;
    })
    .join('\n');

  return `export enum ${enumName} {\n${enumValues}\n}`;
}
