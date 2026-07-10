// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - CASL types work at runtime but have moduleResolution issues
import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Injectable } from '@nestjs/common';

// Define actions
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

// Define subjects (resources)
export type Subjects =
  | 'users'
  | 'roles'
  | 'permissions'
  | 'posts'
  | 'categories'
  | 'tags'
  | 'settings'
  | 'modules'
  | 'all';

export type AppAbility = Ability<[Action, Subjects]>;

export interface UserWithPermissions {
  id: number;
  email: string;
  roles?: Array<{
    name: string; // This is the slug
    permissions?: Array<{
      slug: string;
    }>;
  }>;
}

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UserWithPermissions): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(Ability as AbilityClass<AppAbility>);

    // Check if user is super admin (using name as slug)
    const isSuperAdmin = user.roles?.some((role) => role.name === 'super_admin');

    if (isSuperAdmin) {
      // Super admin can do everything
      can('manage', 'all');
      return build();
    }

    // Collect all permissions from all roles
    const permissions = new Set<string>();

    user.roles?.forEach((role) => {
      role.permissions?.forEach((permission) => {
        permissions.add(permission.slug);
      });
    });

    // Map permissions to CASL rules
    for (const permissionSlug of permissions) {
      const [resource, action] = permissionSlug.split('.');

      if (!resource || !action) {
        continue; // Skip invalid permission format
      }

      if (action === '*') {
        // Full access to resource (all CRUD operations)
        can('manage', resource as Subjects);
      } else {
        // Specific action on resource
        const caslAction = this.mapActionToCasl(action);
        if (caslAction) {
          can(caslAction, resource as Subjects);
        }
      }
    }

    return build({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      detectSubjectType: (item: any) => item as Subjects,
    });
  }

  /**
   * Map permission action to CASL action
   * Supports wildcards and aliases
   */
  private mapActionToCasl(action: string): Action | null {
    const actionMap: Record<string, Action> = {
      create: 'create',
      read: 'read',
      update: 'update',
      delete: 'delete',
      manage: 'manage',
      // Aliases
      view: 'read',
      edit: 'update',
      remove: 'delete',
    };

    return actionMap[action.toLowerCase()] || null;
  }
}
