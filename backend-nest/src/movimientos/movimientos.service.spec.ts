
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { MovimientosService } from './movimientos.service.js';
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';
import { Movimiento } from './entities/movimiento.entity.js';
import { Producto } from '../productos/entities/producto.entity.js';

describe('MovimientosService', () => {
  let service: MovimientosService;

  const productoMock = {
    id: 1,
    nombre: 'Mouse de prueba',
    stock_actual: 5,
    activo: true,
  };

  const managerMock = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  const dataSourceMock = {
    transaction: vi.fn(),
  };

  const eventosInventarioMock = {
    registrar: vi.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    managerMock.findOne.mockResolvedValue({ ...productoMock });

    managerMock.create.mockImplementation((entidad, datos) => {
      if (entidad === Movimiento) {
        return { ...datos, id: 10 };
      }

      return { ...datos };
    });

    managerMock.save.mockImplementation(async (datos) => datos);

    dataSourceMock.transaction.mockImplementation(
      async (operacion) => operacion(managerMock),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimientosService,
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
        {
          provide: EventosInventarioService,
          useValue: eventosInventarioMock,
        },
      ],
    }).compile();

    service = module.get<MovimientosService>(MovimientosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('debe registrar una entrada y aumentar el stock', async () => {
    const producto = { ...productoMock };
    managerMock.findOne.mockResolvedValue(producto);

    const resultado = await service.create({
      producto_id: 1,
      tipo: 'entrada',
      cantidad: 3,
      motivo: 'Entrada de prueba',
    });

    expect(producto.stock_actual).toBe(8);
    expect(resultado.tipo).toBe('entrada');
    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'entrada',
        productoId: 1,
        stockAnterior: 5,
        stockNuevo: 8,
      }),
    );
  });

  it('debe registrar una salida y disminuir el stock', async () => {
    const producto = { ...productoMock };
    managerMock.findOne.mockResolvedValue(producto);

    const resultado = await service.create({
      producto_id: 1,
      tipo: 'salida',
      cantidad: 2,
      motivo: 'Salida de prueba',
    });

    expect(producto.stock_actual).toBe(3);
    expect(resultado.tipo).toBe('salida');
    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'salida',
        stockAnterior: 5,
        stockNuevo: 3,
      }),
    );
  });

  it('debe permitir un ajuste positivo de stock', async () => {
    const producto = { ...productoMock };
    managerMock.findOne.mockResolvedValue(producto);

    await service.create({
      producto_id: 1,
      tipo: 'ajuste',
      cantidad: 4,
      motivo: 'Ajuste positivo',
    });

    expect(producto.stock_actual).toBe(9);
  });

  it('debe permitir un ajuste negativo si existe stock suficiente', async () => {
    const producto = { ...productoMock };
    managerMock.findOne.mockResolvedValue(producto);

    await service.create({
      producto_id: 1,
      tipo: 'ajuste',
      cantidad: -2,
      motivo: 'Ajuste negativo',
    });

    expect(producto.stock_actual).toBe(3);
  });

  it('debe rechazar una cantidad igual a cero', async () => {
    await expect(
      service.create({
        producto_id: 1,
        tipo: 'entrada',
        cantidad: 0,
        motivo: 'Prueba de cantidad cero',
      }),
    ).rejects.toThrow(
      'La cantidad debe ser distinta de cero y las entradas y salidas deben ser positivas',
    );

    expect(managerMock.save).not.toHaveBeenCalled();
    expect(eventosInventarioMock.registrar).not.toHaveBeenCalled();
  });

  it('debe rechazar una salida que deje el stock negativo', async () => {
    const producto = { ...productoMock, stock_actual: 2 };
    managerMock.findOne.mockResolvedValue(producto);

    await expect(
      service.create({
        producto_id: 1,
        tipo: 'salida',
        cantidad: 5,
        motivo: 'Salida superior al stock',
      }),
    ).rejects.toThrow('El stock no puede quedar por debajo de cero');

    expect(managerMock.save).not.toHaveBeenCalled();
    expect(eventosInventarioMock.registrar).not.toHaveBeenCalled();
  });

  it('debe rechazar un producto inexistente o inactivo', async () => {
    managerMock.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        producto_id: 999,
        tipo: 'entrada',
        cantidad: 2,
        motivo: 'Prueba de producto inexistente',
      }),
    ).rejects.toThrow('Producto no encontrado o inactivo');

    expect(eventosInventarioMock.registrar).not.toHaveBeenCalled();
  });
});
