/**
 * Permission Generator Utility
 * Generates standard CRUD permissions for a module
 */

export interface PermissionDefinition {
  name: string;
  slug: string;
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
    { action: 'read', verb: 'Read', description: `Permission to view and list ${resource}` },
    { action: 'create', verb: 'Create', description: `Permission to create new ${resource}` },
    { action: 'update', verb: 'Update', description: `Permission to update existing ${resource}` },
    { action: 'delete', verb: 'Delete', description: `Permission to delete ${resource}` },
  ];

  const permissions: PermissionDefinition[] = actions.map((item) => ({
    name: `${item.verb} ${display}`,
    slug: `${resource}.${item.action}`,
    resource: resource,
    action: item.action,
    description: item.description,
  }));

  // Generate SQL INSERT statement for tenant schema
  const sqlValues = permissions
    .map(
      (p) =>
        `  ('${p.name}', '${p.slug}', '${p.resource}', '${p.action}', '${p.description}')`,
    )
    .join(',\n');

  const sqlInsert = `
-- Auto-generated permissions for ${resource} module
-- Generated at: ${new Date().toISOString().split('T')[0]}
-- NOTE: This uses tenant_1 schema. Update to target schema if needed.

INSERT INTO tenant_1.permissions (name, slug, resource, action, description)
VALUES
${sqlValues};
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

  const values = permissions
    .map(
      (p) =>
        `  ('${p.name}', '${p.slug}', '${p.resource}', '${p.action}', '${p.description}')`,
    )
    .join(',\n');

  const content = `-- Migration: Add ${moduleName} module permissions
-- Generated: ${new Date().toISOString().split('T')[0]}
-- NOTE: This uses tenant_1 schema. Update to target schema if needed.

INSERT INTO tenant_1.permissions (name, slug, resource, action, description)
VALUES
${values};

-- Optionally assign all permissions to administrator role
-- INSERT INTO tenant_1.role_permissions (role_id, permission_id)
-- SELECT 1, id 
-- FROM tenant_1.permissions 
-- WHERE resource = '${resource}'
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
