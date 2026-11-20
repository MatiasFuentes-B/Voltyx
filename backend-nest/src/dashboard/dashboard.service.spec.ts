
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { DashboardService } from './dashboard.service.js';

function crearQueryBuilder(resultado: any, metodo: string) {
  const queryBuilder: any = {};

  queryBuilder.where = vi.fn(() => queryBuilder);
  queryBuilder.andWhere = vi.fn(() => queryBuilder);
  queryBuilder.select = vi.fn(() => queryBuilder);
  queryBuilder.orderBy = vi.fn(() => queryBuilder);

  queryBuilder[metodo] = vi.fn().mockResolvedValue(resultado);

  return queryBuilder;
}

describe('DashboardService', () => {
  let service: DashboardService;

  const productosRepositoryMock = {
    count: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  const comprasRepositoryMock = {
    createQueryBuilder: vi.fn(),
  };

  const movimientosRepositoryMock = {
    find: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    productosRepositoryMock.count.mockResolvedValue(8);

    productosRepositoryMock.createQueryBuilder
      .mockReturnValueOnce(crearQueryBuilder(5, 'getCount'))
      .mockReturnValueOnce(
        crearQueryBuilder({ valor: '108000' }, 'getRawOne'),
      )
      .mockReturnValueOnce(
        crearQueryBuilder(
          [
            {
              id: 1,
              nombre: 'Mouse de prueba',
              codigo: 'VOL-001',
              stock_actual: 0,
              stock_minimo: 2,
            },
          ],
          'getMany',
        ),
      );

    comprasRepositoryMock.createQueryBuilder.mockReturnValue(
      crearQueryBuilder({ total: '10000' }, 'getRawOne'),
    );

    movimientosRepositoryMock.find.mockResolvedValue([
      {
        id: 1,
        producto: { nombre: 'Mouse de prueba' },
        tipo: 'entrada',
        cantidad: 5,
        fecha: new Date('2026-11-19T10:00:00'),
      },
    ]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: 'ProductoRepository',
          useValue: productosRepositoryMock,
        },
        {
          provide: 'CompraRepository',
          useValue: comprasRepositoryMock,
        },
        {
          provide: 'MovimientoRepository',
          useValue: movimientosRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('debe obtener los indicadores principales del dashboard', async () => {
    const resultado = await service.getDashboard();

    expect(resultado.total_productos).toBe(8);
    expect(resultado.productos_bajo_stock).toBe(5);
    expect(resultado.valor_inventario).toBe(108000);
    expect(resultado.compras_mes_total).toBe(10000);
  });

  it('debe obtener las alertas de reposición', async () => {
    const resultado = await service.getDashboard();

    expect(resultado.alertas_reposicion).toHaveLength(1);
    expect(resultado.alertas_reposicion[0]).toEqual({
      id: 1,
      nombre: 'Mouse de prueba',
      codigo: 'VOL-001',
      stock_actual: 0,
      stock_minimo: 2,
    });
  });

  it('debe obtener los últimos movimientos', async () => {
    const resultado = await service.getDashboard();

    expect(resultado.ultimos_movimientos).toHaveLength(1);
    expect(resultado.ultimos_movimientos[0].producto_nombre).toBe(
      'Mouse de prueba',
    );
    expect(resultado.ultimos_movimientos[0].tipo).toBe('entrada');
    expect(resultado.ultimos_movimientos[0].cantidad).toBe(5);
  });

  it('debe consultar los movimientos más recientes', async () => {
    await service.getDashboard();

    expect(movimientosRepositoryMock.find).toHaveBeenCalledWith({
      relations: { producto: true },
      order: { fecha: 'DESC' },
      take: 5,
    });
  });
});
