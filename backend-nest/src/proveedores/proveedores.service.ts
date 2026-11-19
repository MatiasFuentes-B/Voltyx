import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proveedor } from './entities/proveedor.entity.js';
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedoresRepository: Repository<Proveedor>,
    private eventosInventarioService: EventosInventarioService,
  ) {}

  // Listar todos los proveedores
  findAll() {
    return this.proveedoresRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  // Buscar un proveedor por ID
  async findOne(id: number) {
    const proveedor = await this.proveedoresRepository.findOne({
      where: { id },
    });

    if (!proveedor) {
      throw new NotFoundException('Proveedor no encontrado');
    }

    return proveedor;
  }

  // Crear un proveedor
  async create(datos: Partial<Proveedor>) {
  const proveedor = this.proveedoresRepository.create(datos);

  const proveedorGuardado = await this.proveedoresRepository.save(proveedor);

  await this.eventosInventarioService.registrar({
    tipoEvento: 'proveedor_creado',
    entidadId: proveedorGuardado.id,
    entidadNombre: proveedorGuardado.nombre,
    descripcion: 'Se creó un proveedor',
  });

  return proveedorGuardado;
}

  // Actualizar un proveedor
  async update(id: number, datos: Partial<Proveedor>) {
  const proveedor = await this.findOne(id);

  Object.assign(proveedor, datos);

  const proveedorActualizado = await this.proveedoresRepository.save(proveedor);

  await this.eventosInventarioService.registrar({
    tipoEvento: 'proveedor_modificado',
    entidadId: proveedorActualizado.id,
    entidadNombre: proveedorActualizado.nombre,
    descripcion: 'Se modificó un proveedor',
    detalles: {
      camposModificados: Object.keys(datos),
      cambios: datos,
    },
  });

  return proveedorActualizado;
}

  // Eliminar un proveedor
  async remove(id: number) {
  const proveedor = await this.findOne(id);

  await this.proveedoresRepository.remove(proveedor);

  await this.eventosInventarioService.registrar({
    tipoEvento: 'proveedor_eliminado',
    entidadId: proveedor.id,
    entidadNombre: proveedor.nombre,
    descripcion: 'Se eliminó un proveedor',
  });

  return {
    mensaje: 'Proveedor eliminado correctamente',
  };
}}
