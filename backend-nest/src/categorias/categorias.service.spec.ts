
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { CategoriasService } from './categorias.service.js';
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';
import { Categoria } from './entities/categoria.entity.js';

describe('CategoriasService', () => {
  let service: CategoriasService;

  const categoriasRepositoryMock = {
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
        CategoriasService,
        {
          provide: 'CategoriaRepository',
          useValue: categoriasRepositoryMock,
        },
        {
          provide: EventosInventarioService,
          useValue: eventosInventarioMock,
        },
      ],
    }).compile();

    service = module.get<CategoriasService>(CategoriasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('debe listar todas las categorías', async () => {
    const categorias = [
      { id: 1, nombre: 'Accesorios' },
      { id: 2, nombre: 'Computación' },
    ];

    categoriasRepositoryMock.find.mockResolvedValue(categorias);

    const resultado = await service.findAll();

    expect(resultado).toEqual(categorias);
    expect(categoriasRepositoryMock.find).toHaveBeenCalledWith({
      order: { nombre: 'ASC' },
    });
  });

  it('debe encontrar una categoría existente', async () => {
    const categoria = {
      id: 1,
      nombre: 'Accesorios',
    } as Categoria;

    categoriasRepositoryMock.findOne.mockResolvedValue(categoria);

    const resultado = await service.findOne(1);

    expect(resultado).toEqual(categoria);
  });

  it('debe generar un error si la categoría no existe', async () => {
    categoriasRepositoryMock.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(
      'Categoría no encontrada',
    );
  });

  it('debe crear una categoría y registrar la auditoría', async () => {
    const categoria = {
      nombre: 'Accesorios',
    };

    const categoriaGuardada = {
      id: 1,
      nombre: 'Accesorios',
    };

    categoriasRepositoryMock.create.mockReturnValue(categoria);
    categoriasRepositoryMock.save.mockResolvedValue(categoriaGuardada);

    const resultado = await service.create(categoria);

    expect(resultado).toEqual(categoriaGuardada);

    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'categoria_creada',
        entidadId: 1,
        entidadNombre: 'Accesorios',
      }),
    );
  });

  it('debe rechazar una categoría con nombre duplicado', async () => {
    const errorDuplicado = {
      code: 'ER_DUP_ENTRY',
    };

    categoriasRepositoryMock.create.mockReturnValue({
      nombre: 'Accesorios',
    });

    categoriasRepositoryMock.save.mockRejectedValue(errorDuplicado);

    await expect(
      service.create({ nombre: 'Accesorios' }),
    ).rejects.toThrow('Ya existe una categoría con ese nombre');
  });

  it('debe actualizar una categoría y registrar los cambios', async () => {
    const categoria = {
      id: 1,
      nombre: 'Accesorios',
      descripcion: 'Descripción anterior',
    } as Categoria;

    categoriasRepositoryMock.findOne.mockResolvedValue(categoria);
    categoriasRepositoryMock.save.mockImplementation(async (datos) => datos);

    const resultado = await service.update(1, {
      nombre: 'Accesorios tecnológicos',
    });

    expect(resultado.nombre).toBe('Accesorios tecnológicos');

    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'categoria_modificada',
        entidadId: 1,
        entidadNombre: 'Accesorios tecnológicos',
        detalles: expect.objectContaining({
          camposModificados: ['nombre'],
        }),
      }),
    );
  });

  it('debe eliminar una categoría y registrar la auditoría', async () => {
    const categoria = {
      id: 1,
      nombre: 'Accesorios',
    } as Categoria;

    categoriasRepositoryMock.findOne.mockResolvedValue(categoria);
    categoriasRepositoryMock.remove.mockResolvedValue(categoria);

    const resultado = await service.remove(1);

    expect(categoriasRepositoryMock.remove).toHaveBeenCalledWith(categoria);

    expect(resultado).toEqual({
      mensaje: 'Categoría eliminada correctamente',
    });

    expect(eventosInventarioMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        tipoEvento: 'categoria_eliminada',
        entidadId: 1,
        entidadNombre: 'Accesorios',
      }),
    );
  });
});
