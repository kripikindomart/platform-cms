import { Test, TestingModule } from '@nestjs/testing';
import { MenuItemsRepository } from './menu-items.repository';
import { TenantContextService } from '../../common/context/tenant-context.service';

describe('MenuItemsRepository', () => {
  let repository: MenuItemsRepository;
  let tenantContext: TenantContextService;

  const mockDb = {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  const mockTenantContext = {
    getSchemaName: jest.fn().mockReturnValue('tenant_1'),
    getTenantId: jest.fn().mockReturnValue(1),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuItemsRepository,
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

    repository = module.get<MenuItemsRepository>(MenuItemsRepository);
    tenantContext = module.get<TenantContextService>(TenantContextService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('harus insert data ke schema tenant yang benar', async () => {
      const createData = {
        menu_id: 'test',
      };

      const mockCreated = {
        id: 1,
        ...createData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockDb.returning.mockResolvedValue([mockCreated]);

      const result = await repository.create(createData, 1);

      expect(tenantContext.getSchemaName).toHaveBeenCalled();
      expect(result).toEqual(mockCreated);
    });
  });

  describe('findAll', () => {
    it('harus mengembalikan semua data (tidak termasuk yang di-delete)', async () => {
      const mockData = [
        { id: 1, menu_id: 'test 1', deleted_at: null },
        { id: 2, menu_id: 'test 2', deleted_at: null },
      ];

      mockDb.where.mockResolvedValue(mockData);

      const result = await repository.findAll();

      expect(tenantContext.getSchemaName).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('findById', () => {
    it('harus mengembalikan data berdasarkan ID', async () => {
      const mockData = {
        id: 1,
        menu_id: 'test',
        deleted_at: null,
      };

      mockDb.where.mockResolvedValue([mockData]);

      const result = await repository.findById(1);

      expect(result).toEqual(mockData);
    });

    it('harus return null jika tidak ditemukan', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await repository.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('harus update data dan set updated_by', async () => {
      const updateData = {
        menu_id: 'updated',
      };

      const mockUpdated = {
        id: 1,
        ...updateData,
        updated_at: new Date(),
        updated_by: 1,
      };

      mockDb.returning.mockResolvedValue([mockUpdated]);

      const result = await repository.update(1, updateData, 1);

      expect(tenantContext.getSchemaName).toHaveBeenCalled();
      expect(result).toEqual(mockUpdated);
    });
  });

  describe('softDelete', () => {
    it('harus set deleted_at dan deleted_by', async () => {
      mockDb.returning.mockResolvedValue([
        {
          id: 1,
          deleted_at: new Date(),
          deleted_by: 1,
        },
      ]);

      await repository.softDelete(1, 1);

      expect(tenantContext.getSchemaName).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_by: 1,
        }),
      );
    });
  });

  describe('count', () => {
    it('harus menghitung total records (tidak termasuk yang di-delete)', async () => {
      mockDb.execute.mockResolvedValue([{ count: 10 }]);

      const result = await repository.count();

      expect(result).toBe(10);
      expect(tenantContext.getSchemaName).toHaveBeenCalled();
    });
  });
});
