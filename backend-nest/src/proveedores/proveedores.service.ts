
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Proveedor } from './entities/proveedor.entity.js';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private proveedoresRepository: Repository<Proveedor>,
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
  create(datos: Partial<Proveedor>) {
    const proveedor = this.proveedoresRepository.create(datos);

    return this.proveedoresRepository.save(proveedor);
  }

  // Actualizar un proveedor
  async update(id: number, datos: Partial<Proveedor>) {
    const proveedor = await this.findOne(id);

    Object.assign(proveedor, datos);

    return this.proveedoresRepository.save(proveedor);
  }

  // Eliminar un proveedor
  async remove(id: number) {
    const proveedor = await this.findOne(id);

    await this.proveedoresRepository.remove(proveedor);

    return {
      mensaje: 'Proveedor eliminado correctamente',
    };
  }
}
