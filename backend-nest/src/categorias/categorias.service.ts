import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity.js';
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>,
    private eventosInventarioService: EventosInventarioService,
  ) {}

  // Listar todas las categorías
  findAll() {
    return this.categoriasRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  // Buscar una categoría por ID
  async findOne(id: number) {
    const categoria = await this.categoriasRepository.findOne({
      where: { id },
    });

    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return categoria;
  }

  // Crear una categoría
  async create(datos: Partial<Categoria>) {
  const categoria = this.categoriasRepository.create(datos);

  try {
    const categoriaGuardada = await this.categoriasRepository.save(categoria);

    await this.eventosInventarioService.registrar({
      tipoEvento: 'categoria_creada',
      entidadId: categoriaGuardada.id,
      entidadNombre: categoriaGuardada.nombre,
      descripcion: 'Se creó una categoría',
    });

    return categoriaGuardada;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    throw error;
  }
}

  // Actualizar una categoría
 async update(id: number, datos: Partial<Categoria>) {
  const categoria = await this.findOne(id);

  Object.assign(categoria, datos);

  try {
    const categoriaActualizada = await this.categoriasRepository.save(categoria);

    await this.eventosInventarioService.registrar({
      tipoEvento: 'categoria_modificada',
      entidadId: categoriaActualizada.id,
      entidadNombre: categoriaActualizada.nombre,
      descripcion: 'Se modificó una categoría',
      detalles: {
        camposModificados: Object.keys(datos),
        cambios: datos,
      },
    });

    return categoriaActualizada;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    throw error;
  }
}

  // Eliminar una categoría
async remove(id: number) {
  const categoria = await this.findOne(id);

  await this.categoriasRepository.remove(categoria);

  await this.eventosInventarioService.registrar({
    tipoEvento: 'categoria_eliminada',
    entidadId: categoria.id,
    entidadNombre: categoria.nombre,
    descripcion: 'Se eliminó una categoría',
  });

  return { mensaje: 'Categoría eliminada correctamente' };
}}