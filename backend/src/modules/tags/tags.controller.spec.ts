import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CaslGuard } from '../../core/casl/casl.guard';

describe('TagsController', () => {
  let app: INestApplication;
  let service: TagsService;

  const mockTagsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAllWithQuery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: mockTagsService,
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

    service = module.get<TagsService>(TagsService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /tags', () => {
    it('harus mengembalikan array tags', async () => {
      const mockData = [
        { id: 1, name: 'test 1' },
        { id: 2, name: 'test 2' },
      ];

      mockTagsService.findAllWithQuery.mockResolvedValue({
        data: mockData,
        total: 2,
        page: 1,
        limit: 10,
      });

      const response = await request(app.getHttpServer()).get('/tags').expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('harus support pagination', async () => {
      mockTagsService.findAllWithQuery.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 5,
      });

      await request(app.getHttpServer()).get('/tags?page=2&limit=5').expect(200);

      expect(service.findAllWithQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 5,
        }),
      );
    });
  });

  describe('GET /tags/:id', () => {
    it('harus mengembalikan tag berdasarkan ID', async () => {
      const mockData = {
        id: 1,
        name: 'test',
      };

      mockTagsService.findById.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer()).get('/tags/1').expect(200);

      expect(response.body.data).toEqual(mockData);
      expect(service.findById).toHaveBeenCalledWith(1);
    });

    it('harus return 404 jika tidak ditemukan', async () => {
      mockTagsService.findById.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).get('/tags/999').expect(404);
    });
  });

  describe('POST /tags', () => {
    it('harus membuat tag baru', async () => {
      const createDto = {
        name: 'test',
      };

      const mockCreated = {
        id: 1,
        ...createDto,
      };

      mockTagsService.create.mockResolvedValue(mockCreated);

      const response = await request(app.getHttpServer()).post('/tags').send(createDto).expect(201);

      expect(response.body.data).toEqual(mockCreated);
      expect(service.create).toHaveBeenCalled();
    });

    it('harus return 400 jika data tidak valid', async () => {
      const invalidDto = {};

      await request(app.getHttpServer()).post('/tags').send(invalidDto).expect(400);
    });
  });

  describe('PATCH /tags/:id', () => {
    it('harus mengupdate tag yang ada', async () => {
      const updateDto = {
        name: 'updated',
      };

      const mockUpdated = {
        id: 1,
        ...updateDto,
      };

      mockTagsService.update.mockResolvedValue(mockUpdated);

      const response = await request(app.getHttpServer())
        .patch('/tags/1')
        .send(updateDto)
        .expect(200);

      expect(response.body.data).toEqual(mockUpdated);
      expect(service.update).toHaveBeenCalledWith(1, updateDto, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockTagsService.update.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).patch('/tags/999').send({ name: 'test' }).expect(404);
    });
  });

  describe('DELETE /tags/:id', () => {
    it('harus soft delete tag', async () => {
      mockTagsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/tags/1').expect(200);

      expect(service.delete).toHaveBeenCalledWith(1, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockTagsService.delete.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).delete('/tags/999').expect(404);
    });
  });
});
