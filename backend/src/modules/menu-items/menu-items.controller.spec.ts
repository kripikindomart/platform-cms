import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CaslGuard } from '../../core/casl/casl.guard';

describe('MenuItemsController', () => {
  let app: INestApplication;
  let service: MenuItemsService;

  const mockMenuItemsService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAllWithQuery: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MenuItemsController],
      providers: [
        {
          provide: MenuItemsService,
          useValue: mockMenuItemsService,
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

    service = module.get<MenuItemsService>(MenuItemsService);
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /menu-items', () => {
    it('harus mengembalikan array menu-items', async () => {
      const mockData = [
        { id: 1, menu_id: 'test 1' },
        { id: 2, menu_id: 'test 2' },
      ];

      mockMenuItemsService.findAllWithQuery.mockResolvedValue({
        data: mockData,
        total: 2,
        page: 1,
        limit: 10,
      });

      const response = await request(app.getHttpServer()).get('/menu-items').expect(200);

      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    it('harus support pagination', async () => {
      mockMenuItemsService.findAllWithQuery.mockResolvedValue({
        data: [],
        total: 0,
        page: 2,
        limit: 5,
      });

      await request(app.getHttpServer()).get('/menu-items?page=2&limit=5').expect(200);

      expect(service.findAllWithQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 5,
        }),
      );
    });
  });

  describe('GET /menu-items/:id', () => {
    it('harus mengembalikan menu-item berdasarkan ID', async () => {
      const mockData = {
        id: 1,
        menu_id: 'test',
      };

      mockMenuItemsService.findById.mockResolvedValue(mockData);

      const response = await request(app.getHttpServer()).get('/menu-items/1').expect(200);

      expect(response.body.data).toEqual(mockData);
      expect(service.findById).toHaveBeenCalledWith(1);
    });

    it('harus return 404 jika tidak ditemukan', async () => {
      mockMenuItemsService.findById.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).get('/menu-items/999').expect(404);
    });
  });

  describe('POST /menu-items', () => {
    it('harus membuat menu-item baru', async () => {
      const createDto = {
        menu_id: 'test',
      };

      const mockCreated = {
        id: 1,
        ...createDto,
      };

      mockMenuItemsService.create.mockResolvedValue(mockCreated);

      const response = await request(app.getHttpServer())
        .post('/menu-items')
        .send(createDto)
        .expect(201);

      expect(response.body.data).toEqual(mockCreated);
      expect(service.create).toHaveBeenCalled();
    });

    it('harus return 400 jika data tidak valid', async () => {
      const invalidDto = {};

      await request(app.getHttpServer()).post('/menu-items').send(invalidDto).expect(400);
    });
  });

  describe('PATCH /menu-items/:id', () => {
    it('harus mengupdate menu-item yang ada', async () => {
      const updateDto = {
        menu_id: 'updated',
      };

      const mockUpdated = {
        id: 1,
        ...updateDto,
      };

      mockMenuItemsService.update.mockResolvedValue(mockUpdated);

      const response = await request(app.getHttpServer())
        .patch('/menu-items/1')
        .send(updateDto)
        .expect(200);

      expect(response.body.data).toEqual(mockUpdated);
      expect(service.update).toHaveBeenCalledWith(1, updateDto, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockMenuItemsService.update.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer())
        .patch('/menu-items/999')
        .send({ menu_id: 'test' })
        .expect(404);
    });
  });

  describe('DELETE /menu-items/:id', () => {
    it('harus soft delete menu-item', async () => {
      mockMenuItemsService.delete.mockResolvedValue(undefined);

      await request(app.getHttpServer()).delete('/menu-items/1').expect(200);

      expect(service.delete).toHaveBeenCalledWith(1, undefined);
    });

    it('harus return 404 jika ID tidak ditemukan', async () => {
      mockMenuItemsService.delete.mockRejectedValue(new Error('Not found'));

      await request(app.getHttpServer()).delete('/menu-items/999').expect(404);
    });
  });
});
