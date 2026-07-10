import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseRepository } from './base.repository';
import { TenantContextService } from '../context/tenant-context.service';
import { RepositoryEntity } from './repository.interface';

// Concrete implementation for testing
class TestEntity implements RepositoryEntity {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  created_by: number | null;
  updated_by: number | null;
  deleted_at: Date | null;
  deleted_by: number | null;
}

class TestRepository extends BaseRepository<TestEntity> {
  constructor(db: any, table: any, tenantContext: TenantContextService) {
    super(db, table, tenantContext);
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let mockDb: any;
  let mockTenantContext: any;
  let mockTable: any;

  beforeEach(async () => {
    // Mock database
    mockDb = {
      execute: vi.fn(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      offset: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([
        {
          id: 1,
          name: 'Test',
          created_at: new Date(),
          updated_at: new Date(),
          created_by: 1,
          updated_by: 1,
          deleted_at: null,
          deleted_by: null,
        },
      ]),
    };

    // Mock tenant context
    mockTenantContext = {
      getSchemaName: vi.fn().mockReturnValue('tenant_test'),
    };

    // Mock table
    mockTable = {
      id: { name: 'id' },
      deleted_at: { name: 'deleted_at' },
      created_at: { name: 'created_at' },
      updated_at: { name: 'updated_at' },
      created_by: { name: 'created_by' },
      updated_by: { name: 'updated_by' },
      deleted_by: { name: 'deleted_by' },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'DRIZZLE',
          useValue: mockDb,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContext,
        },
      ],
    }).compile();

    repository = new TestRepository(
      mockDb,
      mockTable,
      module.get(TenantContextService),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('withTenantSchema', () => {
    it('should set and reset search_path', async () => {
      await repository['withTenantSchema'](() => Promise.resolve('test'));

      expect(mockDb.execute).toHaveBeenCalledTimes(2);
      expect(mockDb.execute).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({}),
      );
      expect(mockDb.execute).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({}),
      );
    });

    it('should reset search_path even on error', async () => {
      const error = new Error('Test error');
      
      await expect(
        repository['withTenantSchema'](() => Promise.reject(error)),
      ).rejects.toThrow(error);

      // Should still reset search_path
      expect(mockDb.execute).toHaveBeenCalledTimes(2);
    });

    it('should use tenant schema name from context', async () => {
      await repository['withTenantSchema'](() => Promise.resolve('test'));

      expect(mockTenantContext.getSchemaName).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should find all active records', async () => {
      mockDb.where.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Test 1',
          deleted_at: null,
        },
        {
          id: 2,
          name: 'Test 2',
          deleted_at: null,
        },
      ]);

      const results = await repository.findAll();

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockTable);
      expect(results).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should find record by ID', async () => {
      mockDb.limit.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Test',
          deleted_at: null,
        },
      ]);

      const result = await repository.findById(1);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockTable);
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
    });

    it('should return null if record not found', async () => {
      mockDb.limit.mockResolvedValueOnce([]);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create record with audit fields', async () => {
      const data = { name: 'New Test' };
      const userId = 1;

      const result = await repository.create(data, userId);

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Test',
          created_by: userId,
          updated_by: userId,
        }),
      );
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should create record without userId', async () => {
      const data = { name: 'New Test' };

      const result = await repository.create(data);

      expect(mockDb.values).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Test',
          created_by: null,
          updated_by: null,
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update record with audit fields', async () => {
      const data = { name: 'Updated Test' };
      const userId = 1;

      const result = await repository.update(1, data, userId);

      expect(mockDb.update).toHaveBeenCalledWith(mockTable);
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Updated Test',
          updated_by: userId,
        }),
      );
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('softDelete', () => {
    it('should soft delete record', async () => {
      const userId = 1;

      await repository.softDelete(1, userId);

      expect(mockDb.update).toHaveBeenCalledWith(mockTable);
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_by: userId,
        }),
      );
    });
  });

  describe('restore', () => {
    it('should restore soft deleted record', async () => {
      await repository.restore(1);

      expect(mockDb.update).toHaveBeenCalledWith(mockTable);
      expect(mockDb.set).toHaveBeenCalledWith({
        deleted_at: null,
        deleted_by: null,
      });
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete record', async () => {
      await repository.hardDelete(1);

      expect(mockDb.delete).toHaveBeenCalledWith(mockTable);
    });
  });

  describe('findDeleted', () => {
    it('should find only deleted records', async () => {
      mockDb.where.mockResolvedValueOnce([
        {
          id: 1,
          name: 'Deleted Test',
          deleted_at: new Date(),
        },
      ]);

      const results = await repository.findDeleted();

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockTable);
      expect(results).toBeDefined();
    });
  });

  describe('count', () => {
    it('should count active records', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 5 }]);

      const result = await repository.count();

      expect(mockDb.select).toHaveBeenCalled();
      expect(result).toBe(5);
    });

    it('should return 0 if no count result', async () => {
      mockDb.where.mockResolvedValueOnce([]);

      const result = await repository.count();

      expect(result).toBe(0);
    });
  });

  describe('findAllPaginated', () => {
    it('should return paginated results', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 25 }]);
      mockDb.offset.mockResolvedValueOnce([
        { id: 1, name: 'Test 1' },
        { id: 2, name: 'Test 2' },
      ]);

      const result = await repository.findAllPaginated(undefined, {
        page: 1,
        pageSize: 10,
      });

      expect(result.data).toBeDefined();
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(3);
    });

    it('should use default pagination options', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 15 }]);
      mockDb.offset.mockResolvedValueOnce([]);

      const result = await repository.findAllPaginated();

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
    });
  });
});
