# API CONTRACT
# Platform CMS - Core Framework

**Document Version**: 1.0  
**Last Updated**: 2024-01-08  
**Status**: API Contract Specification  
**Reference**: PROJECT-BRIEF.md, PRD.md, FEATURE-LIST.md, USER-FLOW.md, ERD-DATABASE.md

---

## Pendahuluan

Dokumen ini berisi spesifikasi lengkap API Contract untuk Platform CMS MVP (Phase 1). API dirancang dengan prinsip RESTful, konsisten, dan mudah dikonsumsi oleh frontend maupun third-party applications.

### Prinsip API Design

1. **RESTful Standards**: Menggunakan HTTP verbs yang tepat (GET, POST, PUT, PATCH, DELETE)
2. **Consistent Response**: Format response yang konsisten untuk success dan error
3. **Tenant Isolation**: Semua endpoint tenant-aware dengan automatic schema switching
4. **Security First**: Authentication dan authorization di setiap endpoint
5. **Pagination**: Default pagination untuk list endpoints
6. **Versioning**: API versioning menggunakan URL path (/api/v1/)
7. **Documentation**: OpenAPI 3.0 specification dengan Swagger UI

---

## 1. Base URL

### Development
```
http://localhost:3000/api/v1
```

### Staging
```
https://staging-api.platform-cms.com/api/v1
```

### Production
```
https://api.platform-cms.com/api/v1
```

### URL Structure
```
{base_url}/{module}/{resource}
```

**Contoh**:
- `GET /api/v1/users` - List users
- `GET /api/v1/users/:id` - Get user detail
- `POST /api/v1/auth/login` - Login

---

## 2. Format Response

### 2.1 Success Response

**Structure**:
```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

**Example (Single Resource)**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "isActive": true,
    "createdAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Example (List with Pagination)**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe"
    },
    {
      "id": 2,
      "email": "jane@example.com",
      "name": "Jane Smith"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 2.2 Error Response

**Structure**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Pesan error dalam Bahasa Indonesia",
    "errors": []
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Example (Validation Error)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validasi gagal",
    "errors": [
      {
        "field": "email",
        "message": "Email tidak valid"
      },
      {
        "field": "password",
        "message": "Password minimal 8 karakter"
      }
    ]
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Example (Permission Error)**:
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Anda tidak memiliki akses untuk melakukan operasi ini",
    "errors": []
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

## 3. Authentication Header

### Request Header
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
X-Tenant-ID: {tenant_id} (optional, extracted from JWT)
```

### JWT Token Structure
```json
{
  "userId": 1,
  "email": "john@example.com",
  "tenantId": 1,
  "roles": ["admin"],
  "iat": 1704700800,
  "exp": 1704787200
}
```

### Token Storage
- **Cookie**: `access_token` (HTTP-only, Secure, SameSite=Strict)
- **Header**: `Authorization: Bearer {token}`

### Token Expiry
- **Access Token**: 24 hours
- **Refresh Token**: 30 days (Phase 2)

---

## 4. Common Query Parameters

### Pagination
```
?page=1&perPage=10
```

**Default**:
- `page`: 1
- `perPage`: 10

**Max**:
- `perPage`: 100

---

### Filtering
```
?filter[field]=value
?filter[status]=active
?filter[role]=admin
```

**Multiple Filters**:
```
?filter[status]=active&filter[role]=admin
```

---

### Sorting
```
?sort=field:asc
?sort=createdAt:desc
```

**Multiple Sort**:
```
?sort=name:asc,createdAt:desc
```

---

### Search
```
?search=keyword
```

**Behavior**: Search across multiple fields (name, email, dll)

---

### Include Related Data
```
?include=roles,permissions
```

---

## 5. HTTP Status Codes

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource, conflict state |
| 422 | Unprocessable Entity | Semantic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Maintenance mode |

---


## 6. Error Codes

| Code | HTTP Status | Message | Deskripsi |
|------|-------------|---------|-----------|
| VALIDATION_ERROR | 400 | Validasi gagal | Input validation error |
| AUTHENTICATION_REQUIRED | 401 | Autentikasi diperlukan | Missing token |
| INVALID_TOKEN | 401 | Token tidak valid | Expired or malformed token |
| INVALID_CREDENTIALS | 401 | Email atau password salah | Login failed |
| PERMISSION_DENIED | 403 | Akses ditolak | No permission |
| RESOURCE_NOT_FOUND | 404 | Data tidak ditemukan | Resource not found |
| DUPLICATE_RESOURCE | 409 | Data sudah ada | Unique constraint violation |
| CONFLICT_STATE | 409 | Konflik data | Concurrent modification |
| RATE_LIMIT_EXCEEDED | 429 | Terlalu banyak permintaan | Rate limit hit |
| INTERNAL_ERROR | 500 | Terjadi kesalahan sistem | Server error |
| MODULE_DISABLED | 403 | Module tidak tersedia | Module not enabled for tenant |
| TENANT_INACTIVE | 403 | Tenant tidak aktif | Tenant is inactive |
| USER_INACTIVE | 403 | User tidak aktif | User is inactive |

---

## 7. Authentication Endpoints

### 7.1 Register

**Endpoint**: `POST /api/v1/auth/register`

**Permission**: Public (No auth required)

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "phone": "+6281234567890"
}
```

**Validation Rules**:
- `email`: Required, valid email format, unique
- `password`: Required, min 8 characters, must contain uppercase, lowercase, number
- `name`: Required, min 2 characters, max 255 characters
- `phone`: Optional, valid phone format

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+6281234567890",
    "isActive": true,
    "isVerified": false,
    "createdAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "Registrasi berhasil. Silakan cek email untuk verifikasi.",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validasi gagal",
    "errors": [
      {
        "field": "email",
        "message": "Email sudah terdaftar"
      }
    ]
  }
}
```

---

### 7.2 Login

**Endpoint**: `POST /api/v1/auth/login`

**Permission**: Public

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "tenantId": 1,
      "roles": ["admin"],
      "permissions": ["users.create", "users.read", "users.update"]
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  },
  "meta": {
    "message": "Login berhasil",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email atau password salah",
    "errors": []
  }
}
```

**Error Response** (403 - User Inactive):
```json
{
  "success": false,
  "error": {
    "code": "USER_INACTIVE",
    "message": "Akun Anda tidak aktif. Hubungi administrator.",
    "errors": []
  }
}
```

---

### 7.3 Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Permission**: Authenticated user

**Request Body**: None

**Success Response** (200):
```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Logout berhasil",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 7.4 Request Password Reset

**Endpoint**: `POST /api/v1/auth/password-reset/request`

**Permission**: Public

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Link reset password telah dikirim ke email Anda",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Note**: Response selalu success meskipun email tidak ditemukan (security best practice)

---

### 7.5 Reset Password

**Endpoint**: `POST /api/v1/auth/password-reset/confirm`

**Permission**: Public (dengan valid token)

**Request Body**:
```json
{
  "token": "reset_token_here",
  "password": "NewSecurePass123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Password berhasil diubah. Silakan login dengan password baru.",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token tidak valid atau sudah expired",
    "errors": []
  }
}
```

---

### 7.6 Change Password

**Endpoint**: `POST /api/v1/auth/password/change`

**Permission**: `users.update.own`

**Request Body**:
```json
{
  "oldPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Password berhasil diubah",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validasi gagal",
    "errors": [
      {
        "field": "oldPassword",
        "message": "Password lama tidak sesuai"
      }
    ]
  }
}
```

---

### 7.7 Get Current User

**Endpoint**: `GET /api/v1/auth/me`

**Permission**: Authenticated user

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+6281234567890",
    "avatarUrl": "https://example.com/avatar.jpg",
    "tenantId": 1,
    "tenant": {
      "id": 1,
      "name": "Acme Corp",
      "slug": "acme-corp"
    },
    "roles": [
      {
        "id": 1,
        "name": "admin",
        "displayName": "Administrator"
      }
    ],
    "permissions": ["users.create", "users.read", "users.update"],
    "isActive": true,
    "isVerified": true,
    "lastLoginAt": "2024-01-08T09:00:00.000Z",
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

---

## 8. User Management Endpoints

### 8.1 List Users

**Endpoint**: `GET /api/v1/users`

**Permission**: `users.read.tenant` or `users.read.all`

**Query Parameters**:
- `page`: Page number (default: 1)
- `perPage`: Items per page (default: 10, max: 100)
- `search`: Search by name or email
- `filter[role]`: Filter by role name
- `filter[isActive]`: Filter by status (true/false)
- `sort`: Sort field (name:asc, email:desc, createdAt:desc)
- `include`: Include relations (roles, tenant)

**Example Request**:
```
GET /api/v1/users?page=1&perPage=10&search=john&filter[isActive]=true&sort=name:asc&include=roles
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "phone": "+6281234567890",
      "avatarUrl": null,
      "isActive": true,
      "isVerified": true,
      "lastLoginAt": "2024-01-08T09:00:00.000Z",
      "roles": [
        {
          "id": 1,
          "name": "admin",
          "displayName": "Administrator"
        }
      ],
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 50,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 8.2 Get User Detail

**Endpoint**: `GET /api/v1/users/:id`

**Permission**: `users.read.own` (own data) or `users.read.tenant`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+6281234567890",
    "avatarUrl": "https://example.com/avatar.jpg",
    "isActive": true,
    "isVerified": true,
    "lastLoginAt": "2024-01-08T09:00:00.000Z",
    "lastLoginIp": "192.168.1.1",
    "mustChangePassword": false,
    "passwordChangedAt": "2024-01-01T10:00:00.000Z",
    "roles": [
      {
        "id": 1,
        "name": "admin",
        "displayName": "Administrator",
        "description": "Full access administrator"
      }
    ],
    "permissions": ["users.create", "users.read", "users.update"],
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-08T10:00:00.000Z",
    "createdBy": {
      "id": 2,
      "name": "Admin User"
    }
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User tidak ditemukan",
    "errors": []
  }
}
```

---

### 8.3 Create User

**Endpoint**: `POST /api/v1/users`

**Permission**: `users.create.tenant`

**Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "SecurePass123",
  "name": "Jane Smith",
  "phone": "+6281234567891",
  "roleIds": [2, 3]
}
```

**Validation Rules**:
- `email`: Required, valid email, unique in tenant
- `password`: Required, min 8 chars (or auto-generate if empty)
- `name`: Required, min 2 chars, max 255 chars
- `phone`: Optional, valid phone format
- `roleIds`: Required, array of role IDs, at least 1 role

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "jane@example.com",
    "name": "Jane Smith",
    "phone": "+6281234567891",
    "isActive": true,
    "isVerified": false,
    "roles": [
      {
        "id": 2,
        "name": "operator",
        "displayName": "Operator"
      }
    ],
    "createdAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "User berhasil dibuat",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 8.4 Update User

**Endpoint**: `PUT /api/v1/users/:id`

**Permission**: `users.update.own` (own data) or `users.update.tenant`

**Request Body**:
```json
{
  "name": "John Doe Updated",
  "phone": "+6281234567899",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**Validation Rules**:
- `name`: Optional, min 2 chars, max 255 chars
- `phone`: Optional, valid phone format
- `avatarUrl`: Optional, valid URL
- `email`: Cannot be updated (immutable)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe Updated",
    "phone": "+6281234567899",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "updatedAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "User berhasil diupdate",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 8.5 Delete User (Soft Delete)

**Endpoint**: `DELETE /api/v1/users/:id`

**Permission**: `users.delete.tenant`

**Success Response** (200):
```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "User berhasil dihapus",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Error Response** (403 - Cannot delete self):
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Anda tidak dapat menghapus akun sendiri",
    "errors": []
  }
}
```

---

### 8.6 Restore User

**Endpoint**: `POST /api/v1/users/:id/restore`

**Permission**: `users.delete.tenant` (same as delete)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe",
    "deletedAt": null
  },
  "meta": {
    "message": "User berhasil di-restore",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 8.7 Activate/Deactivate User

**Endpoint**: `PATCH /api/v1/users/:id/status`

**Permission**: `users.update.tenant`

**Request Body**:
```json
{
  "isActive": false
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "isActive": false,
    "updatedAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "Status user berhasil diubah",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 8.8 Assign Roles to User

**Endpoint**: `POST /api/v1/users/:id/roles`

**Permission**: `users.update.tenant`

**Request Body**:
```json
{
  "roleIds": [1, 2, 3]
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "roles": [
      {
        "id": 1,
        "name": "admin",
        "displayName": "Administrator"
      },
      {
        "id": 2,
        "name": "operator",
        "displayName": "Operator"
      }
    ]
  },
  "meta": {
    "message": "Role berhasil di-assign",
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---


## 9. Role Management Endpoints

### 9.1 List Roles

**Endpoint**: `GET /api/v1/roles`

**Permission**: `roles.read.tenant`

**Query Parameters**: page, perPage, search, filter[isActive], sort

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "admin",
      "displayName": "Administrator",
      "description": "Full access administrator",
      "isSystem": true,
      "isActive": true,
      "userCount": 5,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

---

### 9.2 Get Role Detail

**Endpoint**: `GET /api/v1/roles/:id`

**Permission**: `roles.read.tenant`

**Query Parameters**: `include=permissions`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "admin",
    "displayName": "Administrator",
    "description": "Full access administrator",
    "isSystem": true,
    "isActive": true,
    "permissions": [
      {
        "id": 1,
        "resource": "users",
        "action": "create",
        "scope": "tenant",
        "description": "Create users in tenant"
      },
      {
        "id": 2,
        "resource": "users",
        "action": "read",
        "scope": "tenant",
        "description": "Read all users in tenant"
      }
    ],
    "userCount": 5,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

---

### 9.3 Create Role

**Endpoint**: `POST /api/v1/roles`

**Permission**: `roles.create.tenant`

**Request Body**:
```json
{
  "name": "manager",
  "displayName": "Manager",
  "description": "Manager role with limited access"
}
```

**Validation Rules**:
- `name`: Required, unique in tenant, lowercase, alphanumeric with dash/underscore
- `displayName`: Required, min 2 chars
- `description`: Optional

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "manager",
    "displayName": "Manager",
    "description": "Manager role with limited access",
    "isSystem": false,
    "isActive": true,
    "createdAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "Role berhasil dibuat"
  }
}
```

---

### 9.4 Update Role

**Endpoint**: `PUT /api/v1/roles/:id`

**Permission**: `roles.update.tenant`

**Request Body**:
```json
{
  "displayName": "Manager Updated",
  "description": "Updated description"
}
```

**Note**: `name` cannot be updated for system roles

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "manager",
    "displayName": "Manager Updated",
    "description": "Updated description",
    "updatedAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "Role berhasil diupdate"
  }
}
```

---

### 9.5 Delete Role (Soft Delete)

**Endpoint**: `DELETE /api/v1/roles/:id`

**Permission**: `roles.delete.tenant`

**Validation**:
- Cannot delete system roles
- Cannot delete if users still assigned

**Success Response** (200):
```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Role berhasil dihapus"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Role tidak dapat dihapus karena masih ada user yang menggunakan role ini",
    "errors": []
  }
}
```

---

### 9.6 Assign Permissions to Role

**Endpoint**: `POST /api/v1/roles/:id/permissions`

**Permission**: `roles.update.tenant`

**Request Body**:
```json
{
  "permissionIds": [1, 2, 3, 4, 5]
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "roleId": 1,
    "permissions": [
      {
        "id": 1,
        "resource": "users",
        "action": "create",
        "scope": "tenant"
      }
    ]
  },
  "meta": {
    "message": "Permission berhasil di-assign"
  }
}
```

---

## 10. Tenant Management Endpoints

### 10.1 List Tenants

**Endpoint**: `GET /api/v1/tenants`

**Permission**: `tenants.read.all` (Super Admin only)

**Query Parameters**: page, perPage, search, filter[isActive], filter[subscriptionTier], sort

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Acme Corp",
      "slug": "acme-corp",
      "domain": "acme.example.com",
      "schemaName": "tenant_acme_corp",
      "subscriptionTier": "pro",
      "subscriptionExpiresAt": "2025-01-01T00:00:00.000Z",
      "isActive": true,
      "userCount": 25,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

### 10.2 Get Tenant Detail

**Endpoint**: `GET /api/v1/tenants/:id`

**Permission**: `tenants.read.all` or `tenants.read.own`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Acme Corp",
    "slug": "acme-corp",
    "domain": "acme.example.com",
    "schemaName": "tenant_acme_corp",
    "subscriptionTier": "pro",
    "subscriptionExpiresAt": "2025-01-01T00:00:00.000Z",
    "config": {
      "branding": {
        "logo": "https://example.com/logo.png",
        "primaryColor": "#3B82F6"
      },
      "features": {
        "maxUsers": 100,
        "maxStorage": 10737418240
      }
    },
    "isActive": true,
    "statistics": {
      "userCount": 25,
      "activeUsers": 20,
      "storageUsed": 5368709120
    },
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 10.3 Create Tenant

**Endpoint**: `POST /api/v1/tenants`

**Permission**: `tenants.create.all` (Super Admin only)

**Request Body**:
```json
{
  "name": "New Company",
  "domain": "newco.example.com",
  "subscriptionTier": "basic",
  "subscriptionExpiresAt": "2025-01-01T00:00:00.000Z",
  "adminEmail": "admin@newco.com",
  "adminName": "Admin User"
}
```

**Validation Rules**:
- `name`: Required, min 2 chars, max 255 chars
- `domain`: Optional, unique, valid domain format
- `subscriptionTier`: Required, enum: free, basic, pro, enterprise
- `subscriptionExpiresAt`: Optional, future date
- `adminEmail`: Required, valid email
- `adminName`: Required, min 2 chars

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": 2,
      "name": "New Company",
      "slug": "new-company",
      "schemaName": "tenant_new_company",
      "subscriptionTier": "basic",
      "isActive": true,
      "createdAt": "2024-01-08T10:00:00.000Z"
    },
    "admin": {
      "id": 10,
      "email": "admin@newco.com",
      "name": "Admin User",
      "temporaryPassword": "TempPass123!"
    }
  },
  "meta": {
    "message": "Tenant berhasil dibuat. Schema database telah di-setup."
  }
}
```

---

### 10.4 Update Tenant

**Endpoint**: `PUT /api/v1/tenants/:id`

**Permission**: `tenants.update.all` or `tenants.update.own`

**Request Body**:
```json
{
  "name": "Acme Corporation",
  "domain": "acme-new.example.com",
  "config": {
    "branding": {
      "logo": "https://example.com/new-logo.png",
      "primaryColor": "#8B5CF6"
    }
  }
}
```

**Note**: `slug` and `schemaName` cannot be updated (immutable)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Acme Corporation",
    "domain": "acme-new.example.com",
    "updatedAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "Tenant berhasil diupdate"
  }
}
```

---

### 10.5 Delete Tenant (Soft Delete)

**Endpoint**: `DELETE /api/v1/tenants/:id`

**Permission**: `tenants.delete.all` (Super Admin only)

**Success Response** (200):
```json
{
  "success": true,
  "data": null,
  "meta": {
    "message": "Tenant berhasil dihapus. Schema akan tetap ada untuk recovery."
  }
}
```

---

### 10.6 Restore Tenant

**Endpoint**: `POST /api/v1/tenants/:id/restore`

**Permission**: `tenants.delete.all`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Acme Corp",
    "isActive": true,
    "deletedAt": null
  },
  "meta": {
    "message": "Tenant berhasil di-restore"
  }
}
```

---

## 11. Module Management Endpoints

### 11.1 List Modules (Global)

**Endpoint**: `GET /api/v1/modules`

**Permission**: `modules.read.all` (Super Admin)

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "user-management",
      "displayName": "User Management",
      "description": "Manage users and roles",
      "icon": "users",
      "routePrefix": "/users",
      "isCore": true,
      "isActive": true,
      "version": "1.0.0",
      "order": 1,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

### 11.2 List Enabled Modules (Tenant)

**Endpoint**: `GET /api/v1/tenant-modules`

**Permission**: Authenticated user (tenant context)

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "module": {
        "id": 1,
        "name": "user-management",
        "displayName": "User Management",
        "icon": "users",
        "routePrefix": "/users"
      },
      "isEnabled": true,
      "config": {
        "customSettings": {
          "showDashboardWidget": true
        }
      },
      "enabledAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

### 11.3 Enable Module for Tenant

**Endpoint**: `POST /api/v1/tenant-modules/:moduleId/enable`

**Permission**: `modules.update.tenant` (Tenant Admin)

**Request Body**:
```json
{
  "config": {
    "customSettings": {
      "defaultView": "list"
    }
  }
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "moduleId": 5,
    "moduleName": "reporting",
    "isEnabled": true,
    "enabledAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "Module berhasil diaktifkan"
  }
}
```

**Error Response** (403 - Subscription Limit):
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Module ini tidak tersedia untuk subscription tier Anda",
    "errors": []
  }
}
```

---

### 11.4 Disable Module for Tenant

**Endpoint**: `POST /api/v1/tenant-modules/:moduleId/disable`

**Permission**: `modules.update.tenant`

**Validation**: Cannot disable core modules

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "moduleId": 5,
    "isEnabled": false,
    "disabledAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "Module berhasil dinonaktifkan"
  }
}
```

---

## 12. Master Data Endpoints

### 12.1 List Categories

**Endpoint**: `GET /api/v1/categories`

**Permission**: `categories.read.tenant`

**Query Parameters**: page, perPage, search, filter[type], filter[isActive], sort

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Berita",
      "slug": "berita",
      "description": "Kategori untuk berita",
      "type": "content",
      "parentId": null,
      "order": 1,
      "isActive": true,
      "children": [
        {
          "id": 2,
          "name": "Berita Nasional",
          "slug": "berita-nasional",
          "parentId": 1
        }
      ],
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

---

### 12.2 Create Category

**Endpoint**: `POST /api/v1/categories`

**Permission**: `categories.create.tenant`

**Request Body**:
```json
{
  "name": "Pengumuman",
  "description": "Kategori untuk pengumuman",
  "type": "content",
  "parentId": null,
  "order": 2
}
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Pengumuman",
    "slug": "pengumuman",
    "description": "Kategori untuk pengumuman",
    "type": "content",
    "parentId": null,
    "order": 2,
    "isActive": true,
    "createdAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "Kategori berhasil dibuat"
  }
}
```

---

### 12.3 List Tags

**Endpoint**: `GET /api/v1/tags`

**Permission**: `tags.read.tenant`

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Urgent",
      "slug": "urgent",
      "color": "#EF4444",
      "description": "Tag untuk item urgent",
      "usageCount": 15,
      "isActive": true,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

---

### 12.4 Create Tag

**Endpoint**: `POST /api/v1/tags`

**Permission**: `tags.create.tenant`

**Request Body**:
```json
{
  "name": "Important",
  "color": "#F59E0B",
  "description": "Tag untuk item penting"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Important",
    "slug": "important",
    "color": "#F59E0B",
    "description": "Tag untuk item penting",
    "usageCount": 0,
    "isActive": true,
    "createdAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "Tag berhasil dibuat"
  }
}
```

---


## 13. Audit Log Endpoints

### 13.1 List Audit Logs

**Endpoint**: `GET /api/v1/audit-logs`

**Permission**: `audit-logs.read.tenant` or `audit-logs.read.all`

**Query Parameters**:
- `page`, `perPage`: Pagination
- `filter[userId]`: Filter by user ID
- `filter[action]`: Filter by action (create, update, delete, login, logout)
- `filter[resource]`: Filter by resource type (users, roles, tenants)
- `filter[resourceId]`: Filter by resource ID
- `filter[dateFrom]`: Filter from date (ISO 8601)
- `filter[dateTo]`: Filter to date (ISO 8601)
- `sort`: Sort by createdAt (default: desc)

**Example Request**:
```
GET /api/v1/audit-logs?filter[userId]=1&filter[action]=delete&filter[dateFrom]=2024-01-01&sort=createdAt:desc
```

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "action": "delete",
      "resource": "users",
      "resourceId": 5,
      "description": "User deleted: Jane Smith",
      "oldValues": {
        "name": "Jane Smith",
        "email": "jane@example.com",
        "isActive": true
      },
      "newValues": null,
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-08T10:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "perPage": 50,
      "total": 500,
      "totalPages": 10
    }
  }
}
```

---

### 13.2 Get Audit Log Detail

**Endpoint**: `GET /api/v1/audit-logs/:id`

**Permission**: `audit-logs.read.tenant` or `audit-logs.read.all`

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "action": "update",
    "resource": "users",
    "resourceId": 5,
    "description": "User updated: Jane Smith",
    "oldValues": {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+6281111111111"
    },
    "newValues": {
      "name": "Jane Smith Updated",
      "email": "jane@example.com",
      "phone": "+6282222222222"
    },
    "changes": [
      {
        "field": "name",
        "oldValue": "Jane Smith",
        "newValue": "Jane Smith Updated"
      },
      {
        "field": "phone",
        "oldValue": "+6281111111111",
        "newValue": "+6282222222222"
      }
    ],
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
    "createdAt": "2024-01-08T10:00:00.000Z"
  }
}
```

---

## 14. Dashboard Endpoints

### 14.1 Get Dashboard Statistics

**Endpoint**: `GET /api/v1/dashboard/statistics`

**Permission**: Authenticated user (data filtered by role)

**Success Response** (200) - Super Admin:
```json
{
  "success": true,
  "data": {
    "tenants": {
      "total": 50,
      "active": 45,
      "inactive": 5,
      "newThisMonth": 3
    },
    "users": {
      "total": 1250,
      "active": 1100,
      "inactive": 150,
      "newThisMonth": 50
    },
    "systemHealth": {
      "apiResponseTime": 150,
      "dbQueryTime": 45,
      "redisStatus": "connected",
      "memoryUsage": 65.5,
      "cpuUsage": 45.2,
      "errorRate": 0.02
    }
  }
}
```

**Success Response** (200) - Tenant Admin:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 25,
      "active": 20,
      "inactive": 5,
      "newThisMonth": 2
    },
    "storage": {
      "used": 5368709120,
      "limit": 10737418240,
      "percentage": 50
    },
    "activities": {
      "todayLogins": 15,
      "todayActions": 250
    }
  }
}
```

---

### 14.2 Get Recent Activities

**Endpoint**: `GET /api/v1/dashboard/activities`

**Permission**: Authenticated user

**Query Parameters**:
- `limit`: Number of activities (default: 10, max: 50)
- `filter[dateFrom]`: Filter from date

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "John Doe",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "action": "login",
      "resource": "auth",
      "description": "User logged in",
      "createdAt": "2024-01-08T10:00:00.000Z"
    },
    {
      "id": 2,
      "user": {
        "id": 2,
        "name": "Jane Smith"
      },
      "action": "create",
      "resource": "users",
      "resourceId": 10,
      "description": "Created new user: Bob Johnson",
      "createdAt": "2024-01-08T09:45:00.000Z"
    }
  ]
}
```

---

## 15. Settings Endpoints

### 15.1 Get System Settings (Global)

**Endpoint**: `GET /api/v1/settings/system`

**Permission**: `settings.read.all` (Super Admin only)

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "key": "site_name",
      "value": "Platform CMS",
      "type": "string",
      "description": "Site name",
      "isPublic": true
    },
    {
      "id": 2,
      "key": "maintenance_mode",
      "value": "false",
      "type": "boolean",
      "description": "Maintenance mode",
      "isPublic": false
    }
  ]
}
```

---

### 15.2 Update System Setting

**Endpoint**: `PUT /api/v1/settings/system/:key`

**Permission**: `settings.update.all`

**Request Body**:
```json
{
  "value": "Platform CMS Production"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "key": "site_name",
    "value": "Platform CMS Production",
    "type": "string",
    "updatedAt": "2024-01-08T10:00:00.000Z"
  },
  "meta": {
    "message": "Setting berhasil diupdate"
  }
}
```

---

### 15.3 Get Tenant Settings

**Endpoint**: `GET /api/v1/settings/tenant`

**Permission**: `settings.read.own` (Tenant Admin)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "branding": {
      "logo": "https://example.com/logo.png",
      "favicon": "https://example.com/favicon.ico",
      "primaryColor": "#3B82F6",
      "secondaryColor": "#8B5CF6"
    },
    "features": {
      "maxUsers": 100,
      "maxStorage": 10737418240,
      "enabledFeatures": ["reporting", "export"]
    },
    "security": {
      "passwordMinLength": 8,
      "sessionTimeout": 1800,
      "mfaEnabled": false
    }
  }
}
```

---

### 15.4 Update Tenant Settings

**Endpoint**: `PUT /api/v1/settings/tenant`

**Permission**: `settings.update.own`

**Request Body**:
```json
{
  "branding": {
    "logo": "https://example.com/new-logo.png",
    "primaryColor": "#8B5CF6"
  },
  "security": {
    "sessionTimeout": 3600
  }
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "branding": {
      "logo": "https://example.com/new-logo.png",
      "primaryColor": "#8B5CF6"
    },
    "security": {
      "sessionTimeout": 3600
    }
  },
  "meta": {
    "message": "Pengaturan tenant berhasil diupdate"
  }
}
```

---

## 16. Health Check Endpoints

### 16.1 Health Check

**Endpoint**: `GET /api/v1/health`

**Permission**: Public (No auth required)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-08T10:00:00.000Z",
    "uptime": 86400,
    "services": {
      "database": "connected",
      "redis": "connected"
    }
  }
}
```

**Error Response** (503):
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Sistem sedang dalam maintenance",
    "errors": []
  }
}
```

---

### 16.2 Readiness Check

**Endpoint**: `GET /api/v1/health/ready`

**Permission**: Public

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "ready": true,
    "checks": {
      "database": true,
      "redis": true,
      "migrations": true
    }
  }
}
```

---

### 16.3 Liveness Check

**Endpoint**: `GET /api/v1/health/live`

**Permission**: Public

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "alive": true
  }
}
```

---

## 17. Permission Matrix

### Module: Authentication
| Method | Endpoint | Permission | Super Admin | Tenant Admin | User | Guest |
|--------|----------|------------|-------------|--------------|------|-------|
| POST | /auth/register | Public | ✅ | ✅ | ✅ | ✅ |
| POST | /auth/login | Public | ✅ | ✅ | ✅ | ✅ |
| POST | /auth/logout | Authenticated | ✅ | ✅ | ✅ | ❌ |
| POST | /auth/password-reset/request | Public | ✅ | ✅ | ✅ | ✅ |
| POST | /auth/password-reset/confirm | Public | ✅ | ✅ | ✅ | ✅ |
| POST | /auth/password/change | users.update.own | ✅ | ✅ | ✅ | ❌ |
| GET | /auth/me | Authenticated | ✅ | ✅ | ✅ | ❌ |

---

### Module: User Management
| Method | Endpoint | Permission | Super Admin | Tenant Admin | User | Guest |
|--------|----------|------------|-------------|--------------|------|-------|
| GET | /users | users.read.tenant | ✅ | ✅ | ❌ | ❌ |
| GET | /users/:id | users.read.own/tenant | ✅ | ✅ | ⚠️ Own only | ❌ |
| POST | /users | users.create.tenant | ✅ | ✅ | ❌ | ❌ |
| PUT | /users/:id | users.update.own/tenant | ✅ | ✅ | ⚠️ Own only | ❌ |
| DELETE | /users/:id | users.delete.tenant | ✅ | ✅ | ❌ | ❌ |
| POST | /users/:id/restore | users.delete.tenant | ✅ | ✅ | ❌ | ❌ |
| PATCH | /users/:id/status | users.update.tenant | ✅ | ✅ | ❌ | ❌ |
| POST | /users/:id/roles | users.update.tenant | ✅ | ✅ | ❌ | ❌ |

---

### Module: Role Management
| Method | Endpoint | Permission | Super Admin | Tenant Admin | User | Guest |
|--------|----------|------------|-------------|--------------|------|-------|
| GET | /roles | roles.read.tenant | ✅ | ✅ | ❌ | ❌ |
| GET | /roles/:id | roles.read.tenant | ✅ | ✅ | ❌ | ❌ |
| POST | /roles | roles.create.tenant | ✅ | ✅ | ❌ | ❌ |
| PUT | /roles/:id | roles.update.tenant | ✅ | ✅ | ❌ | ❌ |
| DELETE | /roles/:id | roles.delete.tenant | ✅ | ✅ | ❌ | ❌ |
| POST | /roles/:id/permissions | roles.update.tenant | ✅ | ✅ | ❌ | ❌ |

---

### Module: Tenant Management
| Method | Endpoint | Permission | Super Admin | Tenant Admin | User | Guest |
|--------|----------|------------|-------------|--------------|------|-------|
| GET | /tenants | tenants.read.all | ✅ | ❌ | ❌ | ❌ |
| GET | /tenants/:id | tenants.read.own/all | ✅ | ⚠️ Own only | ❌ | ❌ |
| POST | /tenants | tenants.create.all | ✅ | ❌ | ❌ | ❌ |
| PUT | /tenants/:id | tenants.update.own/all | ✅ | ⚠️ Own only | ❌ | ❌ |
| DELETE | /tenants/:id | tenants.delete.all | ✅ | ❌ | ❌ | ❌ |
| POST | /tenants/:id/restore | tenants.delete.all | ✅ | ❌ | ❌ | ❌ |

---

### Module: Module Management
| Method | Endpoint | Permission | Super Admin | Tenant Admin | User | Guest |
|--------|----------|------------|-------------|--------------|------|-------|
| GET | /modules | modules.read.all | ✅ | ❌ | ❌ | ❌ |
| GET | /tenant-modules | Authenticated | ✅ | ✅ | ✅ | ❌ |
| POST | /tenant-modules/:id/enable | modules.update.tenant | ✅ | ✅ | ❌ | ❌ |
| POST | /tenant-modules/:id/disable | modules.update.tenant | ✅ | ✅ | ❌ | ❌ |

---

### Module: Master Data
| Method | Endpoint | Permission | Super Admin | Tenant Admin | User | Guest |
|--------|----------|------------|-------------|--------------|------|-------|
| GET | /categories | categories.read.tenant | ✅ | ✅ | ✅ | ⚠️ Public only |
| POST | /categories | categories.create.tenant | ✅ | ✅ | ❌ | ❌ |
| PUT | /categories/:id | categories.update.tenant | ✅ | ✅ | ❌ | ❌ |
| DELETE | /categories/:id | categories.delete.tenant | ✅ | ✅ | ❌ | ❌ |
| GET | /tags | tags.read.tenant | ✅ | ✅ | ✅ | ⚠️ Public only |
| POST | /tags | tags.create.tenant | ✅ | ✅ | ❌ | ❌ |

---

### Module: Audit Logs
| Method | Endpoint | Permission | Super Admin | Tenant Admin | User | Guest |
|--------|----------|------------|-------------|--------------|------|-------|
| GET | /audit-logs | audit-logs.read.tenant/all | ✅ | ⚠️ Tenant only | ❌ | ❌ |
| GET | /audit-logs/:id | audit-logs.read.tenant/all | ✅ | ⚠️ Tenant only | ❌ | ❌ |

---

### Module: Dashboard
| Method | Endpoint | Permission | Super Admin | Tenant Admin | User | Guest |
|--------|----------|------------|-------------|--------------|------|-------|
| GET | /dashboard/statistics | Authenticated | ✅ | ✅ | ✅ | ❌ |
| GET | /dashboard/activities | Authenticated | ✅ | ✅ | ✅ | ❌ |

---

### Module: Settings
| Method | Endpoint | Permission | Super Admin | Tenant Admin | User | Guest |
|--------|----------|------------|-------------|--------------|------|-------|
| GET | /settings/system | settings.read.all | ✅ | ❌ | ❌ | ❌ |
| PUT | /settings/system/:key | settings.update.all | ✅ | ❌ | ❌ | ❌ |
| GET | /settings/tenant | settings.read.own | ✅ | ✅ | ❌ | ❌ |
| PUT | /settings/tenant | settings.update.own | ✅ | ✅ | ❌ | ❌ |

---

### Module: Health Check
| Method | Endpoint | Permission | Super Admin | Tenant Admin | User | Guest |
|--------|----------|------------|-------------|--------------|------|-------|
| GET | /health | Public | ✅ | ✅ | ✅ | ✅ |
| GET | /health/ready | Public | ✅ | ✅ | ✅ | ✅ |
| GET | /health/live | Public | ✅ | ✅ | ✅ | ✅ |

**Legend**:
- ✅ = Full access
- ⚠️ = Limited access (with conditions)
- ❌ = No access

---


## 18. Common Error Scenarios

### 18.1 Validation Error (400)

**Scenario**: User submit form dengan data tidak valid

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validasi gagal",
    "errors": [
      {
        "field": "email",
        "message": "Email tidak valid",
        "value": "invalid-email"
      },
      {
        "field": "password",
        "message": "Password minimal 8 karakter",
        "value": "***"
      }
    ]
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 18.2 Authentication Required (401)

**Scenario**: Request tanpa token atau token invalid

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Autentikasi diperlukan untuk mengakses resource ini",
    "errors": []
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 18.3 Permission Denied (403)

**Scenario**: User tidak punya permission untuk action tertentu

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "PERMISSION_DENIED",
    "message": "Anda tidak memiliki akses untuk melakukan operasi ini",
    "errors": [
      {
        "required": "users.delete.tenant",
        "actual": ["users.read.tenant", "users.update.own"]
      }
    ]
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 18.4 Resource Not Found (404)

**Scenario**: Resource dengan ID tidak ditemukan

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "User dengan ID 999 tidak ditemukan",
    "errors": []
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 18.5 Duplicate Resource (409)

**Scenario**: Create resource dengan unique field yang sudah ada

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_RESOURCE",
    "message": "Email sudah terdaftar",
    "errors": [
      {
        "field": "email",
        "message": "Email john@example.com sudah digunakan",
        "constraint": "unique"
      }
    ]
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 18.6 Conflict State (409)

**Scenario**: Concurrent modification (optimistic locking)

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT_STATE",
    "message": "Data telah diupdate oleh user lain. Silakan refresh dan coba lagi.",
    "errors": [
      {
        "field": "updatedAt",
        "expected": "2024-01-08T09:00:00.000Z",
        "actual": "2024-01-08T09:30:00.000Z"
      }
    ]
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 18.7 Rate Limit Exceeded (429)

**Scenario**: User exceed rate limit

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Terlalu banyak permintaan. Silakan coba lagi dalam 60 detik.",
    "errors": []
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z",
    "retryAfter": 60
  }
}
```

**Response Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704700860
Retry-After: 60
```

---

### 18.8 Internal Server Error (500)

**Scenario**: Unexpected server error

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Terjadi kesalahan sistem. Silakan coba lagi atau hubungi administrator.",
    "errors": []
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

**Note**: Request ID dapat digunakan untuk tracking error di log sistem

---

### 18.9 Module Disabled (403)

**Scenario**: Access route untuk module yang tidak enabled

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "MODULE_DISABLED",
    "message": "Module ini tidak tersedia untuk tenant Anda",
    "errors": [
      {
        "module": "reporting",
        "status": "disabled"
      }
    ]
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

### 18.10 Tenant Inactive (403)

**Scenario**: Request dari tenant yang inactive atau expired

**Response**:
```json
{
  "success": false,
  "error": {
    "code": "TENANT_INACTIVE",
    "message": "Tenant Anda tidak aktif. Hubungi administrator untuk informasi lebih lanjut.",
    "errors": []
  },
  "meta": {
    "requestId": "req_123abc",
    "timestamp": "2024-01-08T10:00:00.000Z"
  }
}
```

---

## 19. Rate Limiting

### Rate Limit Rules

| Scope | Limit | Window | Applicable To |
|-------|-------|--------|---------------|
| Global | 1000 req/min | 1 minute | All endpoints |
| Per Tenant | 500 req/min | 1 minute | All authenticated endpoints |
| Per User | 100 req/min | 1 minute | All authenticated endpoints |
| Login | 5 attempts | 15 minutes | /auth/login |
| Password Reset | 3 requests | 1 hour | /auth/password-reset/* |
| Registration | 3 requests | 1 hour | /auth/register |

### Rate Limit Headers

**Response Headers (All Requests)**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704700860
```

**When Exceeded**:
```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704700860
Retry-After: 60
```

---

## 20. Pagination Details

### Cursor-Based Pagination (Default)

**Request**:
```
GET /api/v1/users?cursor=eyJpZCI6MTAsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDgifQ&perPage=10
```

**Response**:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "perPage": 10,
      "nextCursor": "eyJpZCI6MjAsImNyZWF0ZWRBdCI6IjIwMjQtMDEtMDcifQ",
      "prevCursor": null,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Advantages**:
- Better performance untuk large datasets
- Consistent results (no duplicate/missing items)
- Works well dengan real-time data

---

### Offset-Based Pagination (Optional)

**Request**:
```
GET /api/v1/users?page=2&perPage=10
```

**Response**:
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 2,
      "perPage": 10,
      "total": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": true
    }
  }
}
```

**Use Cases**:
- Need page numbers (UI requirement)
- Need total count
- Small to medium datasets

---

## 21. Filtering Examples

### Simple Filter
```
GET /api/v1/users?filter[isActive]=true
```

### Multiple Filters (AND)
```
GET /api/v1/users?filter[isActive]=true&filter[role]=admin
```

### Filter with Operators

**Equal** (default):
```
?filter[status]=active
```

**Not Equal**:
```
?filter[status][ne]=inactive
```

**Greater Than**:
```
?filter[createdAt][gt]=2024-01-01
```

**Less Than**:
```
?filter[createdAt][lt]=2024-12-31
```

**In Array**:
```
?filter[role][in]=admin,operator
```

**Like (Contains)**:
```
?filter[name][like]=john
```

**Between**:
```
?filter[createdAt][between]=2024-01-01,2024-12-31
```

---

## 22. Sorting Examples

### Single Sort
```
GET /api/v1/users?sort=name:asc
```

### Multiple Sort
```
GET /api/v1/users?sort=isActive:desc,name:asc,createdAt:desc
```

### Sort Direction
- `asc`: Ascending (A-Z, 0-9, oldest first)
- `desc`: Descending (Z-A, 9-0, newest first)

---

## 23. Search Examples

### Simple Search
```
GET /api/v1/users?search=john
```

**Behavior**: Search across multiple fields (name, email)

### Search with Filters
```
GET /api/v1/users?search=john&filter[isActive]=true&sort=name:asc
```

---

## 24. Include Relations Examples

### Single Relation
```
GET /api/v1/users/:id?include=roles
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "roles": [
      {
        "id": 1,
        "name": "admin",
        "displayName": "Administrator"
      }
    ]
  }
}
```

### Multiple Relations
```
GET /api/v1/users/:id?include=roles,tenant,createdBy
```

### Nested Relations
```
GET /api/v1/users/:id?include=roles.permissions
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "roles": [
      {
        "id": 1,
        "name": "admin",
        "permissions": [
          {
            "id": 1,
            "resource": "users",
            "action": "create"
          }
        ]
      }
    ]
  }
}
```

---

## 25. API Versioning Strategy

### Current Version
- **v1**: Current stable version
- **Base URL**: `/api/v1/`

### Deprecation Policy
1. **Announcement**: 6 months before deprecation
2. **Warning Headers**: Added to deprecated endpoints
3. **Sunset Header**: Date when endpoint will be removed
4. **Grace Period**: 6 months after deprecation announcement

### Deprecation Headers

**Response Headers**:
```
Deprecation: true
Sunset: Sat, 01 Jul 2024 00:00:00 GMT
Link: </api/v2/users>; rel="successor-version"
Warning: 299 - "This API version is deprecated. Please migrate to v2."
```

---

## 26. API Security Best Practices

### Request Security

1. **Use HTTPS**: All requests must use HTTPS in production
2. **Token in Header**: Send JWT in Authorization header, NOT in URL
3. **CSRF Protection**: Use CSRF token for state-changing operations (POST, PUT, DELETE)
4. **Input Validation**: All input validated server-side
5. **Output Encoding**: All output encoded to prevent XSS

### Response Security

1. **No Sensitive Data**: Never expose password, token in response
2. **Minimal Error Details**: Don't expose stack trace or internal details
3. **Rate Limiting**: Protect against brute force attacks
4. **Audit Logging**: Log all critical operations

---

## 27. Testing API Endpoints

### Using cURL

**Login**:
```bash
curl -X POST https://api.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123"}'
```

**Get Users (with token)**:
```bash
curl -X GET https://api.example.com/api/v1/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Using Postman

1. Import OpenAPI spec dari `/api/v1/docs/json`
2. Set environment variable untuk `baseUrl` dan `token`
3. Use collection runner untuk automated testing

### Using Swagger UI

1. Navigate to `/api/v1/docs`
2. Click "Authorize" button
3. Enter JWT token
4. Try endpoints interactively

---

## 28. Webhooks (Phase 2)

**Note**: Webhooks tidak termasuk MVP Phase 1, akan diimplementasikan di Phase 2.

### Webhook Events (Phase 2)

- `user.created`
- `user.updated`
- `user.deleted`
- `tenant.created`
- `tenant.updated`
- `role.assigned`
- `module.enabled`
- `module.disabled`

### Webhook Payload Format (Phase 2)

```json
{
  "event": "user.created",
  "timestamp": "2024-01-08T10:00:00.000Z",
  "tenantId": 1,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

---

## 29. API Changelog

### Version 1.0.0 (2024-01-08)

**Initial Release**:
- Authentication endpoints (register, login, logout, password reset)
- User management CRUD
- Role management CRUD
- Tenant management CRUD (Super Admin)
- Module management (enable/disable per tenant)
- Master data (categories, tags)
- Audit logs
- Dashboard statistics
- Settings management
- Health check endpoints

**Security Features**:
- JWT authentication
- RBAC with CASL
- Rate limiting
- Input sanitization
- Soft delete

**API Features**:
- RESTful standards
- Consistent response format
- Pagination (cursor and offset)
- Filtering and sorting
- Search
- Include relations
- OpenAPI 3.0 documentation

---

## 30. Migration Guide

### Breaking Changes Policy

**Semantic Versioning**:
- **Major**: Breaking changes (v1 → v2)
- **Minor**: New features, backward compatible (v1.0 → v1.1)
- **Patch**: Bug fixes (v1.0.0 → v1.0.1)

### Migration Steps (v1 → v2, Future)

1. **Read Migration Guide**: Review all breaking changes
2. **Test in Staging**: Test new endpoints in staging environment
3. **Update Client Code**: Update API calls to new format
4. **Deploy Gradually**: Use feature flags untuk gradual rollout
5. **Monitor**: Monitor error rates dan performance
6. **Deprecate Old Version**: After grace period

---

## 31. Support and Resources

### Documentation

- **API Docs**: https://api.example.com/api/v1/docs
- **OpenAPI Spec**: https://api.example.com/api/v1/docs/json
- **Developer Guide**: https://docs.example.com/developers
- **Changelog**: https://docs.example.com/changelog

### Support Channels

- **Email**: support@example.com
- **Issue Tracker**: https://github.com/example/platform-cms/issues
- **Discord**: https://discord.gg/platform-cms
- **Stack Overflow**: Tag `platform-cms`

### Rate Limits

- **Development**: 100 requests/minute
- **Production**: 1000 requests/minute
- **Enterprise**: Custom limits

---

## 32. Checklist Implementation

### Backend Implementation

- [ ] Setup NestJS project
- [ ] Configure Drizzle ORM
- [ ] Implement authentication endpoints
- [ ] Implement user management endpoints
- [ ] Implement role management endpoints
- [ ] Implement tenant management endpoints
- [ ] Implement module management endpoints
- [ ] Implement master data endpoints
- [ ] Implement audit log endpoints
- [ ] Implement dashboard endpoints
- [ ] Implement settings endpoints
- [ ] Implement health check endpoints
- [ ] Setup Swagger documentation
- [ ] Implement rate limiting
- [ ] Implement error handling
- [ ] Write API tests
- [ ] Security audit

### Frontend Integration

- [ ] Create API client (axios/fetch)
- [ ] Implement authentication flow
- [ ] Implement token management
- [ ] Implement error handling
- [ ] Create API hooks (React Query/SWR)
- [ ] Test all endpoints
- [ ] Handle loading states
- [ ] Handle error states

---

## 33. Status MVP

| Module | Status | Completion |
|--------|--------|------------|
| Authentication | ✅ Specified | 100% |
| User Management | ✅ Specified | 100% |
| Role Management | ✅ Specified | 100% |
| Tenant Management | ✅ Specified | 100% |
| Module Management | ✅ Specified | 100% |
| Master Data | ✅ Specified | 100% |
| Audit Logs | ✅ Specified | 100% |
| Dashboard | ✅ Specified | 100% |
| Settings | ✅ Specified | 100% |
| Health Check | ✅ Specified | 100% |
| Webhooks | ⏳ Phase 2 | 0% |
| GraphQL | ⏳ Phase 2 | 0% |

---

## Referensi

### Internal Documents
- `PROJECT-BRIEF.md` - Project overview & single source of truth
- `PRD.md` - Product requirements & user stories
- `FEATURE-LIST.md` - Complete feature breakdown (99 features)
- `USER-FLOW.md` - User journeys & interaction flows
- `ERD-DATABASE.md` - Database schema & relationships (15 tables)

### External Standards
- REST API: https://restfulapi.net/
- OpenAPI 3.0: https://swagger.io/specification/
- HTTP Status Codes: https://httpstatuses.com/
- JWT: https://jwt.io/
- OAuth 2.0: https://oauth.net/2/ (Phase 2)

---

**END OF DOCUMENT**

**Document Created**: 2024-01-08  
**Last Updated**: 2024-01-08  
**Version**: 1.0  
**Status**: ✅ Complete - Ready for Implementation

**Total Endpoints Documented**: 60+ endpoints across 10 modules  
**Total Permissions Defined**: 50+ permissions  
**Response Format**: Consistent across all endpoints  
**Error Handling**: Standardized error codes and messages in Bahasa Indonesia

