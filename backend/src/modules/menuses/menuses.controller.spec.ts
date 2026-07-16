import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CaslGuard } from '../../core/casl/casl.guard';

describe('MenusController', () => {
  let app: INestApplication;
  let service: MenusService;

  const mockMenusService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAllWithQuery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenusController],
      providers: [
        {
          provide: MenusService,
          useValue: mockMenusService,
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

    service = module.get<MenusService>(MenusService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /menuses', () => {
    it('harus mengembalikan array menuses', async () => {
      const mockData = [
        { id: 1, name: 'test 1' },
        { id: 2, name: 'test 2' },
      ];

      mockMenusService.findAllWithQuery.mockResolvedValue({
        data: mockData,
        total: 2,
        page: 1,
        limit: 10,
      });

      const response = await request(app.getHttpServer()).get('/menuses').expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('harus support pagination', async () => {
      mockMenusService.findAllWithQuery.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 5,
      });

      await request(app.getHttpServer()).get('/menuses?page=2&limit=5').expect(200);

      expect(service.findAllWithQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 5,
        }),
      );
    });
  });

  describe('GET /menuses/:id', () => {
    it('harus mengembalikan menu berdasarkan ID', async () => {
      const mockData = {
        id: 1,
        name: 'test',
      };

      mockMenusService.findById.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer()).get('/menuses/1').expect(200);

      expect(response.body.data).toEqual(mockData);
      expect(service.findById).toHaveBeenCalledWith(1);
    });

    it('harus return 404 jika tidak ditemukan', async () => {
      mockMenusService.findById.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).get('/menuses/999').expect(404);
    });
  });

  describe('POST /menuses', () => {
    it('harus membuat menu baru', async () => {
      const createDto = {
        name: 'test',
      };

      const mockCreated = {
        id: 1,
        ...createDto,
      };

      mockMenusService.create.mockResolvedValue(mockCreated);

      const response = await request(app.getHttpServer())
        .post('/menuses')
        .send(createDto)
        .expect(201);

      expect(response.body.data).toEqual(mockCreated);
      expect(service.create).toHaveBeenCalled();
    });

    it('harus return 400 jika data tidak valid', async () => {
      const invalidDto = {};

      await request(app.getHttpServer()).post('/menuses').send(invalidDto).expect(400);
    });
  });

  describe('PATCH /menuses/:id', () => {
    it('harus mengupdate menu yang ada', async () => {
      const updateDto = {
        name: 'updated',
      };

      const mockUpdated = {
        id: 1,
        ...updateDto,
      };

      mockMenusService.update.mockResolvedValue(mockUpdated);

      const response = await request(app.getHttpServer())
        .patch('/menuses/1')
        .send(updateDto)
        .expect(200);

      expect(response.body.data).toEqual(mockUpdated);
      expect(service.update).toHaveBeenCalledWith(1, updateDto, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockMenusService.update.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).patch('/menuses/999').send({ name: 'test' }).expect(404);
    });
  });

  describe('DELETE /menuses/:id', () => {
    it('harus soft delete menu', async () => {
      mockMenusService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/menuses/1').expect(200);

      expect(service.delete).toHaveBeenCalledWith(1, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockMenusService.delete.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).delete('/menuses/999').expect(404);
    });
  });
});
