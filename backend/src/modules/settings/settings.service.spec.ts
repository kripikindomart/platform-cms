import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { SettingsRepository } from './settings.repository';
import { AuditService } from '../../core/audit/audit.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let repository: SettingsRepository;

  const mockSettingsRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    count: jest.fn(),
    findAllWithQuery: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: SettingsRepository,
          useValue: mockSettingsRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    repository = module.get<SettingsRepository>(SettingsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('harus mengembalikan array settings', async () => {
      const mockData = [
        { id: 1, category: 'test 1', created_at: new Date(), updated_at: new Date() },
        { id: 2, category: 'test 2', created_at: new Date(), updated_at: new Date() },
      ];

      mockSettingsRepository.findAll.mockResolvedValue(mockData);

      const result = await service.findAll();

      expect(result).toEqual(mockData);
      expect(repository.findAll).toHaveBeenCalled();
    });

    it('harus mengembalikan array kosong jika tidak ada data', async () => {
      mockSettingsRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('harus mengembalikan setting berdasarkan ID', async () => {
      const mockData = {
        id: 1,
        category: 'test',
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSettingsRepository.findById.mockResolvedValue(mockData);

      const result = await service.findById(1);

      expect(result).toEqual(mockData);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('harus throw NotFoundException jika tidak ditemukan', async () => {
      mockSettingsRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('harus membuat setting baru', async () => {
      const createDto = {
        category: 'test',
      };

      const mockCreated = {
        id: 1,
        ...createDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSettingsRepository.create.mockResolvedValue(mockCreated);

      const result = await service.create(createDto, 1);

      expect(result).toEqual(mockCreated);
      expect(repository.create).toHaveBeenCalledWith(createDto, 1);
    });
  });

  describe('update', () => {
    it('harus mengupdate setting yang ada', async () => {
      const updateDto = {
        category: 'updated',
      };

      const mockUpdated = {
        id: 1,
        ...updateDto,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockSettingsRepository.findById.mockResolvedValue({ id: 1 });
      mockSettingsRepository.update.mockResolvedValue(mockUpdated);

      const result = await service.update(1, updateDto, 1);

      expect(result).toEqual(mockUpdated);
      expect(repository.update).toHaveBeenCalledWith(1, updateDto, 1);
    });

    it('harus throw NotFoundException jika ID tidak ditemukan', async () => {
      const updateDto = {
        category: 'updated',
      };

      mockSettingsRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateDto, 1)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('harus soft delete setting', async () => {
      mockSettingsRepository.findById.mockResolvedValue({ id: 1 });
      mockSettingsRepository.softDelete.mockResolvedValue(undefined);

      await service.delete(1, 1);

      expect(repository.softDelete).toHaveBeenCalledWith(1, 1);
    });

    it('harus throw NotFoundException jika ID tidak ditemukan', async () => {
      mockSettingsRepository.findById.mockResolvedValue(null);

      await expect(service.delete(999, 1)).rejects.toThrow();
    });
  });

  describe('findAllWithQuery', () => {
    it('harus mengembalikan data dengan pagination', async () => {
      const queryDto = {
        page: 1,
        limit: 10,
      };

      const mockResult = {
        data: [{ id: 1, category: 'test' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockSettingsRepository.findAllWithQuery.mockResolvedValue(mockResult);

      const result = await service.findAllWithQuery(queryDto);

      expect(result).toEqual(mockResult);
      expect(repository.findAllWithQuery).toHaveBeenCalledWith(queryDto);
    });
  });
});
