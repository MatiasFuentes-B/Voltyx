import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';

import { Movimiento } from './entities/movimiento.entity.js';
import { Producto } from '../productos/entities/producto.entity.js';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto.js';
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';

@Injectable()
export class MovimientosService {
  constructor(
    private dataSource: DataSource,
    private eventosInventarioService: EventosInventarioService
  ) {}

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
    const resultado = await this.dataSource.transaction(async (manager) => {
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

      const stockAnterior = producto.stock_actual;
      let nuevaCantidad = stockAnterior;

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

      const movimientoGuardado = await manager.save(movimiento);

      return {
        movimiento: movimientoGuardado,
        evento: {
          tipoEvento: datos.tipo,
          productoId: producto.id,
          productoNombre: producto.nombre,
          cantidad: datos.cantidad,
          stockAnterior,
          stockNuevo: nuevaCantidad,
          motivo: datos.motivo,
          referenciaId: movimientoGuardado.id,
        },
      };
    });

    // Guardar el evento en MongoDB después de confirmar MySQL
    await this.eventosInventarioService.registrar(resultado.evento);

    return resultado.movimiento;
  }
}
