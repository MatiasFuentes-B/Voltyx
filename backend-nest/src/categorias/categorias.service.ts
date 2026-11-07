import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity.js';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private categoriasRepository: Repository<Categoria>,
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
      return await this.categoriasRepository.save(categoria);
    } catch (error: unknown) {
      if (typeof error === 'object' && error!== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
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
      return await this.categoriasRepository.save(categoria);
    } catch (error: unknown) {
      if (typeof error === 'object' && error!== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }

      throw error;
    }
  }

  // Eliminar una categoría
  async remove(id: number) {
    const categoria = await this.findOne(id);

    await this.categoriasRepository.remove(categoria);

    return { mensaje: 'Categoría eliminada correctamente' };
  }
}
