# Task 3.2: RBAC & Permission System (CASL)

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 8 jam  
**Dependencies**: Task 3.1  
**Status**: Belum Dimulai

---

## Tujuan Task

Implement role-based access control (RBAC) system dengan CASL untuk authorization layer. System ini memungkinkan granular permission control untuk setiap resource dan action.

---

## Yang Akan Dikerjakan

### 1. Install Dependencies

```bash
cd backend
npm install @casl/ability @casl/prisma
```

### 2. Struktur File

File yang akan dibuat:

```
backend/src/core/casl/
├── casl.module.ts              (baru) - CASL module
├── casl-ability.factory.ts     (baru) - Ability factory
└── casl.guard.ts               (baru) - Permission guard

backend/src/common/decorators/
├── permissions.decorator.ts    (baru) - @RequirePermissions() decorator
└── check-policies.decorator.ts (baru) - @CheckPolicies() decorator

backend/src/modules/permissions/
├── permissions.module.ts       (baru) - Permissions module
├── permissions.service.ts      (baru) - Permissions business logic
├── permissions.repository.ts   (baru) - Permissions repository
└── dto/
    └── create-permission.dto.ts (baru) - Create permission DTO

backend/src/modules/roles/
├── roles.module.ts             (baru) - Roles module
├── roles.controller.ts         (baru) - Roles endpoints
├── roles.service.ts            (baru) - Roles business logic
├── roles.repository.ts         (baru) - Roles repository (extends BaseRepository)
└── dto/
    ├── create-role.dto.ts      (baru) - Create role DTO
    ├── update-role.dto.ts      (baru) - Update role DTO
    └── assign-permissions.dto.ts (baru) - Assign permissions DTO
```

### 3. CASL Permission System

**Permission Format**:
```
{resource}.{action}
```

Examples:
- `users.create` - Can create users
- `users.read` - Can read users
- `users.update` - Can update users
- `users.delete` - Can delete users
- `posts.publish` - Can publish posts
- `settings.manage` - Can manage settings

**CASL Abilities**:
```typescript
// Define abilities based on user roles
ability.can('read', 'users')      // Can read users
ability.can('create', 'posts')    // Can create posts
ability.cannot('delete', 'admin') // Cannot delete admin users

// Check permission
if (ability.can('update', 'users')) {
  // Allow update
}
```

### 4. System Roles

**Default Roles**:
1. **super_admin** - Full access to everything
2. **admin** - Full access dalam tenant scope
3. **user** - Basic read access

**Role Hierarchy**:
```
super_admin (global)
  └── admin (tenant)
      └── user (tenant)
```

### 5. Features

**Roles Management**:
- Create role
- Update role
- Delete role (soft delete)
- Assign permissions to role
- Remove permissions from role
- List roles
- Get role details

**Permissions Management**:
- List all permissions
- Get permission details
- Check user permissions
- Validate permission format

**User Role Assignment** (already in users table):
- Assign role to user (via user_roles junction)
- Remove role from user
- Get user roles
- Get user permissions (computed from roles)

### 6. CASL Guard

**Guard Implementation**:
```typescript
@Injectable()
export class CaslGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers = this.reflector.get<PolicyHandler[]>(
      CHECK_POLICIES_KEY,
      context.getHandler(),
    );

    if (!policyHandlers) {
      return true; // No policies defined, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const ability = this.caslAbilityFactory.createForUser(user);

    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
```

**Usage in Controller**:
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, CaslGuard)
export class UsersController {
  @Get()
  @CheckPolicies((ability: AppAbility) => ability.can('read', 'users'))
  async findAll() {
    // Only users dengan permission users.read dapat access
  }

  @Post()
  @CheckPolicies((ability: AppAbility) => ability.can('create', 'users'))
  async create(@Body() dto: CreateUserDto) {
    // Only users dengan permission users.create dapat access
  }

  @Delete(':id')
  @CheckPolicies((ability: AppAbility) => ability.can('delete', 'users'))
  async remove(@Param('id') id: string) {
    // Only users dengan permission users.delete dapat access
  }
}
```

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

### Dependencies
- [ ] @casl/ability installed
- [ ] @casl/prisma installed (optional)

### CASL Module
- [ ] CaslModule created
- [ ] CaslAbilityFactory implemented
- [ ] CaslGuard implemented
- [ ] CheckPolicies decorator implemented
- [ ] RequirePermissions decorator implemented

### Permissions Module
- [ ] PermissionsModule created
- [ ] PermissionsService implemented
- [ ] PermissionsRepository implemented
- [ ] Can list all permissions
- [ ] Can validate permission format

### Roles Module
- [ ] RolesModule created
- [ ] RolesService implemented
- [ ] RolesRepository extends BaseRepository
- [ ] RolesController dengan CRUD endpoints
- [ ] DTOs dengan Zod validation

### Role Management Endpoints
- [ ] POST /api/roles - Create role
- [ ] GET /api/roles - List all roles
- [ ] GET /api/roles/:id - Get role details
- [ ] PATCH /api/roles/:id - Update role
- [ ] DELETE /api/roles/:id - Soft delete role
- [ ] POST /api/roles/:id/permissions - Assign permissions
- [ ] DELETE /api/roles/:id/permissions/:permissionId - Remove permission

### Integration
- [ ] CASL integrated dengan JWT guard
- [ ] User roles loaded from database
- [ ] User permissions computed from roles
- [ ] Ability factory creates correct abilities
- [ ] Guard blocks unauthorized access

### Testing
- [ ] Type-check passes
- [ ] Lint passes
- [ ] Can create role
- [ ] Can assign permissions to role
- [ ] Can check user permissions
- [ ] Guard blocks access without permission
- [ ] Guard allows access with permission
- [ ] Super admin has full access

---

## Cara Testing

### 1. Type Check & Lint

```bash
cd backend
npm run type-check
npm run lint
```

Expected: No errors

### 2. Setup Test Data

Create test script untuk seed roles & permissions:

```bash
npm run seed:roles
```

Expected: 3 roles created (super_admin, admin, user) dengan permissions

### 3. Test Role Management

**Create Role**:
```bash
curl -X POST http://localhost:3000/api/roles \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Editor",
    "slug": "editor",
    "description": "Content editor role",
    "level": 2
  }'
```

Expected: Role created

**List Roles**:
```bash
curl -X GET http://localhost:3000/api/roles \
  -H "Authorization: Bearer {user_token}"
```

Expected: List of roles

**Assign Permissions**:
```bash
curl -X POST http://localhost:3000/api/roles/1/permissions \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "permission_ids": [1, 2, 3]
  }'
```

Expected: Permissions assigned

### 4. Test Permission Checking

**Super Admin Access** (should pass):
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer {super_admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

Expected: User created (super admin can do everything)

**Regular User Access** (should fail):
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer {user_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "password": "Test123!@#",
    "name": "Test User 2"
  }'
```

Expected: 403 Forbidden (user doesn't have users.create permission)

---

## Implementasi Notes

### CASL Ability Definition

```typescript
import { Ability, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from '@/modules/users/entities/user.entity';
import { PermissionsService } from '@/modules/permissions/permissions.service';

type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage';
type Subjects = 'users' | 'roles' | 'posts' | 'settings' | 'all';

export type AppAbility = Ability<[Actions, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  constructor(private permissionsService: PermissionsService) {}

  async createForUser(user: User): Promise<AppAbility> {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    // Get user permissions from roles
    const permissions = await this.permissionsService.getUserPermissions(user.id);

    // Check if user is super admin
    const isSuperAdmin = user.roles?.some((role) => role.slug === 'super_admin');

    if (isSuperAdmin) {
      // Super admin can do everything
      can('manage', 'all');
      return build();
    }

    // Map permissions to CASL rules
    for (const permission of permissions) {
      const [resource, action] = permission.slug.split('.');
      
      if (action === '*') {
        // Full access to resource
        can('manage', resource as Subjects);
      } else {
        // Specific action
        can(action as Actions, resource as Subjects);
      }
    }

    return build();
  }
}
```

### Permission Decorator

```typescript
import { SetMetadata } from '@nestjs/common';

export const CHECK_POLICIES_KEY = 'check_policy';

export type PolicyHandler = (ability: AppAbility) => boolean;

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
```

### Roles Repository

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
import * as tenantSchema from '@/database/schema/tenant';
import { BaseRepository } from '@/common/database/base.repository';
import { TenantContextService } from '@/common/context/tenant-context.service';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesRepository extends BaseRepository<Role> {
  constructor(
    @Inject('DRIZZLE') db: NodePgDatabase<typeof tenantSchema>,
    tenantContext: TenantContextService,
  ) {
    super(db, tenantSchema.roles, tenantContext);
  }

  async findBySlug(slug: string): Promise<Role | null> {
    return this.withTenantSchema(async () => {
      const results = await this.db
        .select()
        .from(this.table)
        .where(
          and(
            eq(this.table.slug, slug),
            eq(this.table.deleted_at, null),
          ),
        )
        .limit(1);

      return results[0] || null;
    });
  }

  async getRoleWithPermissions(roleId: number): Promise<Role | null> {
    return this.withTenantSchema(async () => {
      const results = await this.db
        .select({
          role: tenantSchema.roles,
          permissions: tenantSchema.permissions,
        })
        .from(tenantSchema.roles)
        .leftJoin(
          tenantSchema.rolePermissions,
          eq(tenantSchema.roles.id, tenantSchema.rolePermissions.role_id),
        )
        .leftJoin(
          tenantSchema.permissions,
          eq(tenantSchema.rolePermissions.permission_id, tenantSchema.permissions.id),
        )
        .where(
          and(
            eq(tenantSchema.roles.id, roleId),
            eq(tenantSchema.roles.deleted_at, null),
          ),
        );

      if (results.length === 0) return null;

      const role = results[0].role;
      role.permissions = results
        .filter((r) => r.permissions !== null)
        .map((r) => r.permissions);

      return role;
    });
  }

  async assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    return this.withTenantSchema(async () => {
      const values = permissionIds.map((permissionId) => ({
        role_id: roleId,
        permission_id: permissionId,
        created_at: new Date(),
      }));

      await this.db.insert(tenantSchema.rolePermissions).values(values);
    });
  }

  async removePermission(roleId: number, permissionId: number): Promise<void> {
    return this.withTenantSchema(async () => {
      await this.db
        .delete(tenantSchema.rolePermissions)
        .where(
          and(
            eq(tenantSchema.rolePermissions.role_id, roleId),
            eq(tenantSchema.rolePermissions.permission_id, permissionId),
          ),
        );
    });
  }
}
```

---

## Security Notes

1. **Permission Format**: Always use `{resource}.{action}` format (e.g., `users.create`)
2. **Super Admin**: Has unrestricted access via `can('manage', 'all')`
3. **Tenant Isolation**: Permissions are tenant-scoped (dalam tenant schema)
4. **Guard Order**: Always use `@UseGuards(JwtAuthGuard, CaslGuard)` - JWT first, then CASL
5. **Default Deny**: If no policies defined, default to deny (set in guard)
6. **Audit Logging**: Log all permission checks dan role changes

---

## Documentation References

- TECHNICAL-ARCHITECTURE.md Section 5.2 - Authorization & RBAC
- FEATURE-LIST.md Section 2 - RBAC features
- ERD-DATABASE.md Section 2.2-2.5 - Roles & Permissions tables
- CASL Documentation: https://casl.js.org/v6/en/

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 3.3: Session Management & Refresh Tokens** - Implement session tracking dan token refresh mechanism

---

## Output Expected

Setelah task selesai:
1. CASL module fully implemented
2. Roles module dengan CRUD endpoints
3. Permissions module dengan query endpoints
4. CaslGuard protecting routes
5. CheckPolicies decorator working
6. User permissions computed from roles
7. Super admin has full access
8. Type-check passing
9. Lint passing
10. Manual testing successful

**Permission Flow**:
```
Request → JWT Guard → User Loaded → CASL Guard → Load Permissions → Build Ability → Check Policy → Allow/Deny
```

**Role Assignment Flow**:
```
Create Role → Assign Permissions → Assign Role to User → User Gets Permissions
```
