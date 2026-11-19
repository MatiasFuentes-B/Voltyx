import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ProductosService } from './productos.service.js';

describe('ProductosService', () => {
  let service: ProductosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: 'ProductoRepository',
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});