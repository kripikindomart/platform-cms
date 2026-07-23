import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UploadSettingsController } from './upload-settings.controller';
import { UploadSettingsService } from './upload-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CaslGuard } from '../../core/casl/casl.guard';

describe('UploadSettingsController', () => {
  let app: INestApplication;
  let service: UploadSettingsService;

  const mockUploadSettingsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAllWithQuery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadSettingsController],
      providers: [
        {
          provide: UploadSettingsService,
          useValue: mockUploadSettingsService,
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

    service = module.get<UploadSettingsService>(UploadSettingsService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /upload-settings', () => {
    it('harus mengembalikan array upload-settings', async () => {
      const mockData = [
        { id: 1, category: 'test 1' },
        { id: 2, category: 'test 2' },
      ];

      mockUploadSettingsService.findAllWithQuery.mockResolvedValue({
        data: mockData,
        total: 2,
        page: 1,
        limit: 10,
      });

      const response = await request(app.getHttpServer()).get('/upload-settings').expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('harus support pagination', async () => {
      mockUploadSettingsService.findAllWithQuery.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 5,
      });

      await request(app.getHttpServer()).get('/upload-settings?page=2&limit=5').expect(200);

      expect(service.findAllWithQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 5,
        }),
      );
    });
  });

  describe('GET /upload-settings/:id', () => {
    it('harus mengembalikan upload-setting berdasarkan ID', async () => {
      const mockData = {
        id: 1,
        category: 'test',
      };

      mockUploadSettingsService.findById.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer()).get('/upload-settings/1').expect(200);

      expect(response.body.data).toEqual(mockData);
      expect(service.findById).toHaveBeenCalledWith(1);
    });

    it('harus return 404 jika tidak ditemukan', async () => {
      mockUploadSettingsService.findById.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).get('/upload-settings/999').expect(404);
    });
  });

  describe('POST /upload-settings', () => {
    it('harus membuat upload-setting baru', async () => {
      const createDto = {
        category: 'test',
      };

      const mockCreated = {
        id: 1,
        ...createDto,
      };

      mockUploadSettingsService.create.mockResolvedValue(mockCreated);

      const response = await request(app.getHttpServer())
        .post('/upload-settings')
        .send(createDto)
        .expect(201);

      expect(response.body.data).toEqual(mockCreated);
      expect(service.create).toHaveBeenCalled();
    });

    it('harus return 400 jika data tidak valid', async () => {
      const invalidDto = {};

      await request(app.getHttpServer()).post('/upload-settings').send(invalidDto).expect(400);
    });
  });

  describe('PATCH /upload-settings/:id', () => {
    it('harus mengupdate upload-setting yang ada', async () => {
      const updateDto = {
        category: 'updated',
      };

      const mockUpdated = {
        id: 1,
        ...updateDto,
      };

      mockUploadSettingsService.update.mockResolvedValue(mockUpdated);

      const response = await request(app.getHttpServer())
        .patch('/upload-settings/1')
        .send(updateDto)
        .expect(200);

      expect(response.body.data).toEqual(mockUpdated);
      expect(service.update).toHaveBeenCalledWith(1, updateDto, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockUploadSettingsService.update.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer())
        .patch('/upload-settings/999')
        .send({ category: 'test' })
        .expect(404);
    });
  });

  describe('DELETE /upload-settings/:id', () => {
    it('harus soft delete upload-setting', async () => {
      mockUploadSettingsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/upload-settings/1').expect(200);

      expect(service.delete).toHaveBeenCalledWith(1, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockUploadSettingsService.delete.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).delete('/upload-settings/999').expect(404);
    });
  });
});
