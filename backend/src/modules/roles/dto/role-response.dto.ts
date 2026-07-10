export class PermissionResponseDto {
  id!: number;
  slug!: string;
  name!: string;
  resource!: string;
  action!: string;
  scope!: string;
  description!: string | null;
  created_at!: Date;

  constructor(partial: Partial<PermissionResponseDto>) {
    Object.assign(this, partial);
  }
}

export class RoleResponseDto {
  id!: number;
  name!: string; // slug
  display_name!: string;
  description!: string | null;
  is_system!: boolean;
  is_active!: boolean;
  created_by!: number | null;
  created_at!: Date;
  updated_at!: Date;
  deleted_at!: Date | null;
  permissions?: PermissionResponseDto[];

  constructor(partial: Partial<RoleResponseDto>) {
    Object.assign(this, partial);
  }
}

export class RoleWithPermissionsResponseDto extends RoleResponseDto {
  permissions!: PermissionResponseDto[];

  constructor(partial: Partial<RoleWithPermissionsResponseDto>) {
    super(partial);
    this.permissions = partial.permissions || [];
  }
}

export class AssignPermissionsResponseDto {
  message!: string;
  role_id!: number;
  assigned_count!: number;

  constructor(roleId: number, count: number) {
    this.message = `${count} permission berhasil di-assign ke role`;
    this.role_id = roleId;
    this.assigned_count = count;
  }
}

export class RemovePermissionResponseDto {
  message!: string;
  role_id!: number;
  permission_id!: number;

  constructor(roleId: number, permissionId: number) {
    this.message = 'Permission berhasil dihapus dari role';
    this.role_id = roleId;
    this.permission_id = permissionId;
  }
}
