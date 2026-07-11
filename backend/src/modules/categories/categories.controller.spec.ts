import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CaslGuard } from '../../core/casl/casl.guard';

describe('CategoriesController', () => {
  let app: INestApplication;
  let service: CategoriesService;

  const mockCategoriesService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAllWithQuery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
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

    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /categories', () => {
    it('harus mengembalikan array categories', async () => {
      const mockData = [
        { id: 1, parent_id: 'test 1' },
        { id: 2, parent_id: 'test 2' },
      ];

      mockCategoriesService.findAllWithQuery.mockResolvedValue({
        data: mockData,
        total: 2,
        page: 1,
        limit: 10,
      });

      const response = await request(app.getHttpServer()).get('/categories').expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('harus support pagination', async () => {
      mockCategoriesService.findAllWithQuery.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 5,
      });

      await request(app.getHttpServer()).get('/categories?page=2&limit=5').expect(200);

      expect(service.findAllWithQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 5,
        }),
      );
    });
  });

  describe('GET /categories/:id', () => {
    it('harus mengembalikan category berdasarkan ID', async () => {
      const mockData = {
        id: 1,
        parent_id: 'test',
      };

      mockCategoriesService.findById.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer()).get('/categories/1').expect(200);

      expect(response.body.data).toEqual(mockData);
      expect(service.findById).toHaveBeenCalledWith(1);
    });

    it('harus return 404 jika tidak ditemukan', async () => {
      mockCategoriesService.findById.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).get('/categories/999').expect(404);
    });
  });

  describe('POST /categories', () => {
    it('harus membuat category baru', async () => {
      const createDto = {
        parent_id: 'test',
      };

      const mockCreated = {
        id: 1,
        ...createDto,
      };

      mockCategoriesService.create.mockResolvedValue(mockCreated);

      const response = await request(app.getHttpServer())
        .post('/categories')
        .send(createDto)
        .expect(201);

      expect(response.body.data).toEqual(mockCreated);
      expect(service.create).toHaveBeenCalled();
    });

    it('harus return 400 jika data tidak valid', async () => {
      const invalidDto = {};

      await request(app.getHttpServer()).post('/categories').send(invalidDto).expect(400);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('harus mengupdate category yang ada', async () => {
      const updateDto = {
        parent_id: 'updated',
      };

      const mockUpdated = {
        id: 1,
        ...updateDto,
      };

      mockCategoriesService.update.mockResolvedValue(mockUpdated);

      const response = await request(app.getHttpServer())
        .patch('/categories/1')
        .send(updateDto)
        .expect(200);

      expect(response.body.data).toEqual(mockUpdated);
      expect(service.update).toHaveBeenCalledWith(1, updateDto, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockCategoriesService.update.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer())
        .patch('/categories/999')
        .send({ parent_id: 'test' })
        .expect(404);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('harus soft delete category', async () => {
      mockCategoriesService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/categories/1').expect(200);

      expect(service.delete).toHaveBeenCalledWith(1, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockCategoriesService.delete.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).delete('/categories/999').expect(404);
    });
  });
});
