
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { ProveedoresService } from './proveedores.service.js';
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';
import { Proveedor } from './entities/proveedor.entity.js';

describe('ProveedoresService', () => {
  let service: ProveedoresService;

  const proveedoresRepositoryMock = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  };

  const eventosInventarioMock = {
    registrar: vi.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProveedoresService,
        {
          provide: 'ProveedorRepository',
          useValue: proveedoresRepositoryMock,
        },
        {
          provide: EventosInventarioService,
          useValue: eventosInventarioMock,
        },
      ],
    }).compile();

    service = module.get<ProveedoresService>(ProveedoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('debe listar todos los proveedores', async () => {
    const proveedores = [
      { id: 1, nombre: 'Proveedor Central' },
      { id: 2, nombre: 'Distribuidora Norte' },
    ];

    proveedoresRepositoryMock.find.mockResolvedValue(proveedores);

    const resultado = await service.findAll();

    expect(resultado).toEqual(proveedores);
    expect(proveedoresRepositoryMock.find).toHaveBeenCalled();
  });

  it('debe encontrar un proveedor existente', async () => {
    const proveedor = {
      id: 1,
      nombre: 'Proveedor Central',
    } as Proveedor;

    proveedoresRepositoryMock.findOne.mockResolvedValue(proveedor);

    const resultado = await service.findOne(1);

    expect(resultado).toEqual(proveedor);
  });

  it('debe generar un error si el proveedor no existe', async () => {
    proveedoresRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(
      'Proveedor no encontrado',
    );
  });

  it('debe crear un proveedor y registrar la auditoría', async () => {
    const datos = {
      nombre: 'Proveedor de prueba',
      email: 'proveedor@prueba.cl',
    };

    const proveedorGuardado = {
      id: 1,
      ...datos,
    };

    proveedoresRepositoryMock.create.mockReturnValue(datos);
    proveedoresRepositoryMock.save.mockResolvedValue(proveedorGuardado);

    const resultado = await service.create(datos);

    expect(resultado).toEqual(proveedorGuardado);

    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'proveedor_creado',
        entidadId: 1,
        entidadNombre: 'Proveedor de prueba',
      }),
    );
  });

  it('debe actualizar un proveedor y registrar los cambios', async () => {
    const proveedor = {
      id: 1,
      nombre: 'Proveedor anterior',
      email: 'anterior@prueba.cl',
    } as Proveedor;

    proveedoresRepositoryMock.findOne.mockResolvedValue(proveedor);
    proveedoresRepositoryMock.save.mockImplementation(async (datos) => datos);

    const resultado = await service.update(1, {
      nombre: 'Proveedor actualizado',
    });

    expect(resultado.nombre).toBe('Proveedor actualizado');

    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'proveedor_modificado',
        entidadId: 1,
        entidadNombre: 'Proveedor actualizado',
        detalles: expect.objectContaining({
          camposModificados: ['nombre'],
        }),
      }),
    );
  });

  it('debe eliminar un proveedor y registrar la auditoría', async () => {
    const proveedor = {
      id: 1,
      nombre: 'Proveedor de prueba',
    } as Proveedor;

    proveedoresRepositoryMock.findOne.mockResolvedValue(proveedor);
    proveedoresRepositoryMock.remove.mockResolvedValue(proveedor);

    const resultado = await service.remove(1);

    expect(proveedoresRepositoryMock.remove).toHaveBeenCalledWith(proveedor);

    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'proveedor_eliminado',
        entidadId: 1,
        entidadNombre: 'Proveedor de prueba',
      }),
    );

    expect(resultado).toBeDefined();
  });
});
