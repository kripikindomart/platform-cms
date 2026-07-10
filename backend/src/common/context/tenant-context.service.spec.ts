import { Test, TestingModule } from '@nestjs/testing';
import { TenantContextService } from './tenant-context.service';
import { TenantContext } from '../interfaces/tenant.interface';

describe('TenantContextService', () => {
  let service: TenantContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantContextService],
    }).compile();

    // Use resolve() for REQUEST-scoped providers
    service = await module.resolve<TenantContextService>(TenantContextService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setTenant and getTenant', () => {
    it('should set and get tenant successfully', () => {
      const tenant: TenantContext = {
        id: 1,
        name: 'Test Tenant',
        slug: 'test',
        schemaName: 'tenant_test',
      };

      service.setTenant(tenant);
      expect(service.getTenant()).toEqual(tenant);
    });

    it('should throw error when tenant not set', () => {
      expect(() => service.getTenant()).toThrow('Tenant context not set');
    });
  });

  describe('hasTenant', () => {
    it('should return false when tenant not set', () => {
      expect(service.hasTenant()).toBe(false);
    });

    it('should return true when tenant is set', () => {
      const tenant: TenantContext = {
        id: 1,
        name: 'Test',
        slug: 'test',
        schemaName: 'tenant_test',
      };

      service.setTenant(tenant);
      expect(service.hasTenant()).toBe(true);
    });
  });

  describe('getSchemaName', () => {
    it('should return schema name when tenant is set', () => {
      const tenant: TenantContext = {
        id: 1,
        name: 'Test',
        slug: 'test',
        schemaName: 'tenant_test',
      };

      service.setTenant(tenant);
      expect(service.getSchemaName()).toBe('tenant_test');
    });

    it('should throw error when tenant not set', () => {
      expect(() => service.getSchemaName()).toThrow('Tenant context not set');
    });
  });

  describe('getTenantId', () => {
    it('should return tenant ID when tenant is set', () => {
      const tenant: TenantContext = {
        id: 123,
        name: 'Test',
        slug: 'test',
        schemaName: 'tenant_test',
      };

      service.setTenant(tenant);
      expect(service.getTenantId()).toBe(123);
    });

    it('should throw error when tenant not set', () => {
      expect(() => service.getTenantId()).toThrow('Tenant context not set');
    });
  });

  describe('getTenantSlug', () => {
    it('should return tenant slug when tenant is set', () => {
      const tenant: TenantContext = {
        id: 1,
        name: 'Test',
        slug: 'demo-tenant',
        schemaName: 'tenant_demo',
      };

      service.setTenant(tenant);
      expect(service.getTenantSlug()).toBe('demo-tenant');
    });
  });

  describe('getTenantName', () => {
    it('should return tenant name when tenant is set', () => {
      const tenant: TenantContext = {
        id: 1,
        name: 'Demo Tenant Corp',
        slug: 'demo',
        schemaName: 'tenant_demo',
      };

      service.setTenant(tenant);
      expect(service.getTenantName()).toBe('Demo Tenant Corp');
    });
  });

  describe('getTenantConfig', () => {
    it('should return tenant config when set', () => {
      const tenant: TenantContext = {
        id: 1,
        name: 'Test',
        slug: 'test',
        schemaName: 'tenant_test',
        config: {
          branding: {
            primaryColor: '#3B82F6',
          },
        },
      };

      service.setTenant(tenant);
      expect(service.getTenantConfig()).toEqual({
        branding: {
          primaryColor: '#3B82F6',
        },
      });
    });

    it('should return undefined when config not set', () => {
      const tenant: TenantContext = {
        id: 1,
        name: 'Test',
        slug: 'test',
        schemaName: 'tenant_test',
      };

      service.setTenant(tenant);
      expect(service.getTenantConfig()).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear tenant context', () => {
      const tenant: TenantContext = {
        id: 1,
        name: 'Test',
        slug: 'test',
        schemaName: 'tenant_test',
      };

      service.setTenant(tenant);
      expect(service.hasTenant()).toBe(true);

      service.clear();
      expect(service.hasTenant()).toBe(false);
    });
  });
});
