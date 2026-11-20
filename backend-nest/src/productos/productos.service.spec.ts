
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ProductosService } from './productos.service.js';
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';
import { Producto } from './entities/producto.entity.js';

describe('ProductosService', () => {
  let service: ProductosService;

  const productosRepositoryMock = {
    findOne: vi.fn(),
    save: vi.fn(),
  };

  const eventosInventarioMock = {
    registrar: vi.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: 'ProductoRepository',
          useValue: productosRepositoryMock,
        },
        {
          provide: DataSource,
          useValue: {},
        },
        {
          provide: EventosInventarioService,
          useValue: eventosInventarioMock,
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('debe encontrar un producto existente', async () => {
    const producto = {
      id: 1,
      nombre: 'Mouse de prueba',
      activo: true,
    } as Producto;

    productosRepositoryMock.findOne.mockResolvedValue(producto);

    const resultado = await service.findOne(1);

    expect(resultado).toEqual(producto);
    expect(productosRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: 1, activo: true },
      relations: { categoria: true },
    });
  });

  it('debe generar un error si el producto no existe', async () => {
    productosRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(
      'Producto no encontrado',
    );
  });

  it('debe actualizar un producto y registrar la auditoría', async () => {
    const producto = {
      id: 1,
      nombre: 'Mouse anterior',
      activo: true,
    } as Producto;

    productosRepositoryMock.findOne.mockResolvedValue(producto);
    productosRepositoryMock.save.mockImplementation(async (datos) => datos);

    const resultado = await service.update(1, {
      nombre: 'Mouse actualizado',
    });

    expect(resultado.nombre).toBe('Mouse actualizado');

    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'producto_modificado',
        entidadId: 1,
        entidadNombre: 'Mouse actualizado',
      }),
    );
  });

  it('debe desactivar un producto y registrar la auditoría', async () => {
    const producto = {
      id: 1,
      nombre: 'Mouse de prueba',
      activo: true,
    } as Producto;

    productosRepositoryMock.findOne.mockResolvedValue(producto);
    productosRepositoryMock.save.mockImplementation(async (datos) => datos);

    const resultado = await service.remove(1);

    expect(resultado.activo).toBe(false);

    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'producto_desactivado',
        entidadId: 1,
        entidadNombre: 'Mouse de prueba',
      }),
    );
  });
});
