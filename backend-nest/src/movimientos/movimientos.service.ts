
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { Movimiento } from './entities/movimiento.entity.js';
import { Producto } from '../productos/entities/producto.entity.js';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto.js';

@Injectable()
export class MovimientosService {
  constructor(private dataSource: DataSource) {}

  // Listar movimientos
  findAll() {
    return this.dataSource.getRepository(Movimiento).find({
      relations: {
        producto: true,
      },
      order: {
        fecha: 'DESC',
      },
    });
  }

  // Registrar movimiento
  async create(datos: CrearMovimientoDto) {
    return this.dataSource.transaction(async (manager) => {
      if (
        datos.cantidad === 0 ||
        (datos.tipo !== 'ajuste' && datos.cantidad < 0)
      ) {
        throw new BadRequestException(
          'La cantidad debe ser distinta de cero y las entradas y salidas deben ser positivas',
        );
      }

      const producto = await manager.findOne(Producto, {
        where: {
          id: datos.producto_id,
          activo: true,
        },
      });

      if (!producto) {
        throw new NotFoundException('Producto no encontrado o inactivo');
      }

      let nuevaCantidad = producto.stock_actual;

      if (datos.tipo === 'entrada') {
        nuevaCantidad += datos.cantidad;
      } else if (datos.tipo === 'salida') {
        nuevaCantidad -= datos.cantidad;
      } else if (datos.tipo === 'ajuste') {
        nuevaCantidad += datos.cantidad;
      }

      if (nuevaCantidad < 0) {
        throw new BadRequestException(
          'El stock no puede quedar por debajo de cero',
        );
      }

      producto.stock_actual = nuevaCantidad;

      await manager.save(producto);

      const movimiento = manager.create(Movimiento, {
        producto,
        tipo: datos.tipo,
        cantidad: datos.cantidad,
        motivo: datos.motivo,
      });

      return manager.save(movimiento);
    });
  }
}
