import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { MovimientosService } from './movimientos.service.js';
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';
import { vi } from 'vitest';

describe('MovimientosService', () => {
  let service: MovimientosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimientosService,
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

    service = module.get<MovimientosService>(MovimientosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});