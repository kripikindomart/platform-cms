import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CaslGuard } from '../../core/casl/casl.guard';

describe('SettingsController', () => {
  let app: INestApplication;
  let service: SettingsService;

  const mockSettingsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAllWithQuery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: mockSettingsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(CaslGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = module.createNestApplication();
    await app.init();

    service = module.get<SettingsService>(SettingsService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /settings', () => {
    it('harus mengembalikan array settings', async () => {
      const mockData = [
        { id: 1, category: 'test 1' },
        { id: 2, category: 'test 2' },
      ];

      mockSettingsService.findAllWithQuery.mockResolvedValue({
        data: mockData,
        total: 2,
        page: 1,
        limit: 10,
      });

      const response = await request(app.getHttpServer()).get('/settings').expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('harus support pagination', async () => {
      mockSettingsService.findAllWithQuery.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 5,
      });

      await request(app.getHttpServer()).get('/settings?page=2&limit=5').expect(200);

      expect(service.findAllWithQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 5,
        }),
      );
    });
  });

  describe('GET /settings/:id', () => {
    it('harus mengembalikan setting berdasarkan ID', async () => {
      const mockData = {
        id: 1,
        category: 'test',
      };

      mockSettingsService.findById.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer()).get('/settings/1').expect(200);

      expect(response.body.data).toEqual(mockData);
      expect(service.findById).toHaveBeenCalledWith(1);
    });

    it('harus return 404 jika tidak ditemukan', async () => {
      mockSettingsService.findById.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).get('/settings/999').expect(404);
    });
  });

  describe('POST /settings', () => {
    it('harus membuat setting baru', async () => {
      const createDto = {
        category: 'test',
      };

      const mockCreated = {
        id: 1,
        ...createDto,
      };

      mockSettingsService.create.mockResolvedValue(mockCreated);

      const response = await request(app.getHttpServer())
        .post('/settings')
        .send(createDto)
        .expect(201);

      expect(response.body.data).toEqual(mockCreated);
      expect(service.create).toHaveBeenCalled();
    });

    it('harus return 400 jika data tidak valid', async () => {
      const invalidDto = {};

      await request(app.getHttpServer()).post('/settings').send(invalidDto).expect(400);
    });
  });

  describe('PATCH /settings/:id', () => {
    it('harus mengupdate setting yang ada', async () => {
      const updateDto = {
        category: 'updated',
      };

      const mockUpdated = {
        id: 1,
        ...updateDto,
      };

      mockSettingsService.update.mockResolvedValue(mockUpdated);

      const response = await request(app.getHttpServer())
        .patch('/settings/1')
        .send(updateDto)
        .expect(200);

      expect(response.body.data).toEqual(mockUpdated);
      expect(service.update).toHaveBeenCalledWith(1, updateDto, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockSettingsService.update.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer())
        .patch('/settings/999')
        .send({ category: 'test' })
        .expect(404);
    });
  });

  describe('DELETE /settings/:id', () => {
    it('harus soft delete setting', async () => {
      mockSettingsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/settings/1').expect(200);

      expect(service.delete).toHaveBeenCalledWith(1, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockSettingsService.delete.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).delete('/settings/999').expect(404);
    });
  });
});
