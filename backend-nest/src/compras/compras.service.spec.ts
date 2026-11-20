
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ComprasService } from './compras.service.js';
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';
import { Compra } from './entities/compra.entity.js';
import { Producto } from '../productos/entities/producto.entity.js';

describe('ComprasService', () => {
  let service: ComprasService;

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
    getRepository: vi.fn(),
  };

  const eventosInventarioMock = {
    registrar: vi.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    managerMock.create.mockImplementation((entidad, datos) => {
      if (entidad === Compra) {
        return { ...datos, id: 7 };
      }

      return { ...datos };
    });

    managerMock.save.mockImplementation(async (datos) => datos);

    managerMock.findOne.mockImplementation(async (entidad) => {
      if (entidad === Producto) {
        return { ...productoMock };
      }

      return null;
    });

    dataSourceMock.transaction.mockImplementation(
      async (operacion) => operacion(managerMock),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComprasService,
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

    service = module.get<ComprasService>(ComprasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('debe crear una compra y aumentar el stock', async () => {
    const producto = { ...productoMock };

    managerMock.findOne.mockImplementation(async (entidad) => {
      if (entidad === Producto) {
        return producto;
      }

      return null;
    });

    const resultado = await service.create({
      productos: [
        {
          producto_id: 1,
          cantidad: 2,
          precio_unitario: 5000,
        },
      ],
    });

    expect(resultado.id).toBe(7);
    expect(resultado.total).toBe(10000);
    expect(producto.stock_actual).toBe(7);

    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'compra',
        productoId: 1,
        cantidad: 2,
        stockAnterior: 5,
        stockNuevo: 7,
        referenciaId: 7,
      }),
    );
  });

  it('debe rechazar una compra sin productos', async () => {
    await expect(
      service.create({ productos: [] }),
    ).rejects.toThrow(
      'La compra debe contener al menos un producto',
    );

    expect(eventosInventarioMock.registrar).not.toHaveBeenCalled();
  });

  it('debe rechazar una cantidad inválida', async () => {
    await expect(
      service.create({
        productos: [
          {
            producto_id: 1,
            cantidad: 0,
            precio_unitario: 5000,
          },
        ],
      }),
    ).rejects.toThrow(
      'La cantidad debe ser positiva y el precio no puede ser negativo',
    );

    expect(eventosInventarioMock.registrar).not.toHaveBeenCalled();
  });

  it('debe rechazar un producto inexistente o inactivo', async () => {
    managerMock.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        productos: [
          {
            producto_id: 999,
            cantidad: 2,
            precio_unitario: 5000,
          },
        ],
      }),
    ).rejects.toThrow('Producto 999 no encontrado o inactivo');

    expect(eventosInventarioMock.registrar).not.toHaveBeenCalled();
  });

  it('debe anular una compra y descontar el stock', async () => {
    const producto = { ...productoMock };

    const compra = {
      id: 7,
      estado: 'recibida',
      detalles: [
        {
          cantidad: 2,
          producto: { id: 1 },
        },
      ],
    };

    managerMock.findOne.mockImplementation(async (entidad) => {
      if (entidad === Compra) {
        return compra;
      }

      if (entidad === Producto) {
        return producto;
      }

      return null;
    });

    const resultado = await service.anular(7);

    expect(resultado.estado).toBe('anulada');
    expect(producto.stock_actual).toBe(3);

    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'salida',
        productoId: 1,
        cantidad: 2,
        stockAnterior: 5,
        stockNuevo: 3,
        referenciaId: 7,
      }),
    );
  });

  it('debe rechazar la anulación de una compra ya anulada', async () => {
    managerMock.findOne.mockResolvedValue({
      id: 7,
      estado: 'anulada',
      detalles: [],
    });

    await expect(service.anular(7)).rejects.toThrow(
      'La compra ya está anulada',
    );

    expect(eventosInventarioMock.registrar).not.toHaveBeenCalled();
  });

  it('debe rechazar la anulación si no hay stock suficiente', async () => {
    const producto = {
      ...productoMock,
      stock_actual: 1,
    };

    managerMock.findOne.mockImplementation(async (entidad) => {
      if (entidad === Compra) {
        return {
          id: 7,
          estado: 'recibida',
          detalles: [
            {
              cantidad: 2,
              producto: { id: 1 },
            },
          ],
        };
      }

      if (entidad === Producto) {
        return producto;
      }

      return null;
    });

    await expect(service.anular(7)).rejects.toThrow(
      'Stock insuficiente para anular la compra del producto Mouse de prueba',
    );

    expect(managerMock.save).not.toHaveBeenCalled();
    expect(eventosInventarioMock.registrar).not.toHaveBeenCalled();
  });
});
