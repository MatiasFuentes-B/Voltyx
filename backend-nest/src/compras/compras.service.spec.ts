import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ComprasService } from './compras.service.js';
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';
import { vi } from 'vitest';

describe('ComprasService', () => {
  let service: ComprasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComprasService,
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: EventosInventarioService,
          useValue: {
            registrar: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ComprasService>(ComprasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});