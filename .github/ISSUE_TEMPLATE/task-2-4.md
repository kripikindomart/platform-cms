# Task 2.4: Tenant Context Service Implementation

**Prioritas**: P0 - CRITICAL  
**Estimasi Waktu**: 3 jam  
**Dependencies**: Task 2.1, 2.2, 2.3  
**Status**: Belum Dimulai

---

## Tujuan Task

Implement tenant context service untuk manage tenant information per request. Service ini akan digunakan oleh middleware (nanti) dan semua operations yang memerlukan tenant isolation.

**Note**: Middleware dengan JWT akan diimplementasi di Week 5-7 (Authentication tasks). Task ini fokus pada tenant context infrastructure.

---

## Yang Akan Dikerjakan

### 1. Struktur File

File yang akan dibuat:

```
backend/src/common/
├── context/
│   └── tenant-context.service.ts   (baru) - Tenant context per request
├── decorators/
│   └── current-tenant.decorator.ts (baru) - Decorator untuk get tenant
└── interfaces/
    └── tenant.interface.ts         (baru) - Tenant interfaces
```

### 2. Tenant Context Service

**Fungsi**: Service untuk manage tenant context per request (REQUEST-scoped)

**Interface**:
```typescript
export interface TenantContext {
  id: number;
  name: string;
  slug: string;
  schemaName: string;
  config?: Record<string, unknown>;
}
```

**Methods**:
- `setTenant(context: TenantContext)` - Set tenant for current request
- `getTenant()` - Get current tenant context
- `getSchemaName()` - Get schema name
- `getTenantId()` - Get tenant ID
- `hasTenant()` - Check if tenant is set

**Scope**: REQUEST (new instance per request)

### 3. Current Tenant Decorator

**Fungsi**: Decorator untuk inject tenant context ke controller/service

**Usage**:
```typescript
@Get()
async findAll(@CurrentTenant() tenant: TenantContext) {
  console.log(`Tenant: ${tenant.name}`);
  return this.usersService.findAll();
}
```

### 4. Tenant Interfaces

**Fungsi**: Type definitions untuk tenant-related data

**Interfaces**:
- `TenantContext` - Tenant info dalam request context
- `TenantConfig` - Tenant configuration structure
- `TenantInfo` - Full tenant information

---

## Kriteria Selesai (Checklist)

Task ini dianggap selesai jika:

- [ ] File `tenant-context.service.ts` sudah dibuat
- [ ] File `current-tenant.decorator.ts` sudah dibuat
- [ ] File `tenant.interface.ts` sudah dibuat
- [ ] TenantContextService dengan REQUEST scope
- [ ] All methods implemented (setTenant, getTenant, getSchemaName, getTenantId, hasTenant)
- [ ] CurrentTenant decorator working
- [ ] Error handling untuk missing tenant
- [ ] Type-safe interfaces
- [ ] Command `npm run type-check` berhasil tanpa error
- [ ] Command `npm run lint` berhasil tanpa error
- [ ] Unit tests for service
- [ ] Documentation updated

---

## Cara Testing

### 1. Type Check

```bash
cd backend
npm run type-check
```

Expected: No TypeScript errors

### 2. Lint Check

```bash
npm run lint
```

Expected: No linting errors

### 3. Unit Test

Create test file `tenant-context.service.spec.ts`:

```typescript
import { Test } from '@nestjs/testing';
import { TenantContextService } from './tenant-context.service';

describe('TenantContextService', () => {
  let service: TenantContextService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TenantContextService],
    }).compile();

    service = module.get<TenantContextService>(TenantContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set and get tenant', () => {
    const tenant = {
      id: 1,
      name: 'Test Tenant',
      slug: 'test',
      schemaName: 'tenant_test',
    };

    service.setTenant(tenant);
    expect(service.getTenant()).toEqual(tenant);
  });

  it('should get schema name', () => {
    service.setTenant({
      id: 1,
      name: 'Test',
      slug: 'test',
      schemaName: 'tenant_test',
    });

    expect(service.getSchemaName()).toBe('tenant_test');
  });

  it('should throw error when tenant not set', () => {
    expect(() => service.getTenant()).toThrow('Tenant context not set');
  });

  it('should check if tenant is set', () => {
    expect(service.hasTenant()).toBe(false);
    
    service.setTenant({
      id: 1,
      name: 'Test',
      slug: 'test',
      schemaName: 'tenant_test',
    });

    expect(service.hasTenant()).toBe(true);
  });
});
```

Run test:
```bash
npm run test
```

Expected: All tests passing

---

## Implementasi Notes

### REQUEST Scope

TenantContextService MUST be REQUEST-scoped untuk isolasi per request:

```typescript
@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
  private tenant: TenantContext | null = null;

  setTenant(tenant: TenantContext): void {
    this.tenant = tenant;
  }

  getTenant(): TenantContext {
    if (!this.tenant) {
      throw new Error('Tenant context not set. Make sure tenant middleware is applied.');
    }
    return this.tenant;
  }

  hasTenant(): boolean {
    return this.tenant !== null;
  }

  getSchemaName(): string {
    return this.getTenant().schemaName;
  }

  getTenantId(): number {
    return this.getTenant().id;
  }

  getTenantSlug(): string {
    return this.getTenant().slug;
  }

  clear(): void {
    this.tenant = null;
  }
}
```

### Custom Decorator

Create decorator untuk easy access:

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenant;
  },
);
```

### Tenant Interface

Type-safe interfaces:

```typescript
export interface TenantContext {
  id: number;
  name: string;
  slug: string;
  schemaName: string;
  config?: TenantConfig;
}

export interface TenantConfig {
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  features?: {
    maxUsers?: number;
    maxStorage?: number;
    enabledFeatures?: string[];
  };
  limits?: {
    apiRateLimit?: number;
    storageLimit?: number;
  };
}

export interface TenantInfo extends TenantContext {
  domain?: string;
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionExpiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Error Handling

Proper error messages:

```typescript
getTenant(): TenantContext {
  if (!this.tenant) {
    throw new Error(
      'Tenant context not set. ' +
      'Make sure tenant middleware is applied to this route, ' +
      'or set tenant context manually using setTenant().'
    );
  }
  return this.tenant;
}
```

---

## Integration dengan Database Operations

Contoh penggunaan dalam repository:

```typescript
@Injectable()
export class UsersRepository {
  constructor(
    @Inject('DRIZZLE') private db: DrizzleDB,
    private tenantContext: TenantContextService,
  ) {}

  async findAll(): Promise<User[]> {
    const schemaName = this.tenantContext.getSchemaName();
    
    // Set search_path untuk query ke tenant schema
    await this.db.execute(sql.raw(`SET search_path TO "${schemaName}", public`));
    
    // Query users dari tenant schema
    const users = await this.db.query.users.findMany({
      where: isNull(users.deleted_at), // Soft delete filter
    });

    // Reset search_path
    await this.db.execute(sql.raw('RESET search_path'));

    return users;
  }
}
```

---

## Troubleshooting

**Problem**: "Tenant context not set" error  
**Solution**: Ensure service is REQUEST-scoped, bukan SINGLETON

**Problem**: Same tenant across different requests  
**Solution**: Verify REQUEST scope is working, check DI configuration

**Problem**: Cannot inject TenantContextService  
**Solution**: Make sure service is exported from module

**Problem**: Decorator returns undefined  
**Solution**: Ensure tenant is stored in request object: `req['tenant'] = context`

---

## Security Notes

1. **Validation**: Always validate tenant exists dan active sebelum set context
2. **Isolation**: REQUEST scope ensures tenant isolation per request
3. **Audit**: Log tenant switches untuk audit trail
4. **Config**: Never expose sensitive config to frontend
5. **Schema Names**: Validate schema name format untuk prevent SQL injection

---

## Documentation References

- AI-RULES.md Section 5.8 - Tenant isolation mandatory
- TECHNICAL-ARCHITECTURE.md Section 4.2 - Tenant context flow
- NestJS Injection Scopes: https://docs.nestjs.com/fundamentals/injection-scopes

---

## Next Task

Setelah task ini selesai, lanjut ke:
**Task 2.5: Tenant Provisioning Service** - Implement service untuk create new tenant dengan full setup

---

## Output Expected

Setelah task selesai:
1. TenantContextService implemented (REQUEST-scoped)
2. CurrentTenant decorator working
3. Type-safe interfaces defined
4. Error handling implemented
5. Unit tests passing
6. Type-check passing
7. Lint passing
8. Ready untuk integrasi dengan JWT middleware (Week 5-7)
9. Ready untuk use dalam repositories
10. Documentation updated

**Total Complexity**:
- 1 service (REQUEST-scoped)
- 1 decorator
- 3 interfaces
- 5+ methods
- Unit tests
- Error handling
