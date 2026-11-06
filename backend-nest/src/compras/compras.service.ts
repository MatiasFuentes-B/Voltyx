
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { DataSource } from 'typeorm';
import type { CrearCompraDto } from './dto/crear-compra.dto.js';

import { Compra } from './entities/compra.entity.js';
import { DetalleCompra } from './entities/detalle-compra.entity.js';
import { Producto } from '../productos/entities/producto.entity.js';
import { Proveedor } from '../proveedores/entities/proveedor.entity.js';
import { Movimiento } from '../movimientos/entities/movimiento.entity.js';

@Injectable()
export class ComprasService {
  constructor(private dataSource: DataSource) {}


  // Registrar una compra
  async create(datos: CrearCompraDto) {
    return this.dataSource.transaction(async (manager) => {
      if (!datos.productos || datos.productos.length === 0) {
        throw new BadRequestException(
          'La compra debe contener al menos un producto',
        );
      }

      let proveedor: Proveedor | null = null;

      if (datos.proveedor_id) {
        proveedor = await manager.findOne(Proveedor, {
          where: { id: datos.proveedor_id },
        });

        if (!proveedor) {
          throw new NotFoundException('Proveedor no encontrado');
        }
      }

      const compra = manager.create(Compra, {
        proveedor,
        nota: datos.nota,
        estado: 'recibida',
        total: 0,
      });

      const compraGuardada = await manager.save(compra);

      let totalCompra = 0;

      for (const item of datos.productos) {
        if (
          !Number.isInteger(item.cantidad) ||
          item.cantidad <= 0 ||
          !Number.isFinite(item.precio_unitario) ||
          item.precio_unitario < 0
        ) {
          throw new BadRequestException(
            'La cantidad debe ser positiva y el precio no puede ser negativo',
          );
        }

        const producto = await manager.findOne(Producto, {
          where: {
            id: item.producto_id,
            activo: true,
          },
        });

        if (!producto) {
          throw new NotFoundException(
            `Producto ${item.producto_id} no encontrado o inactivo`,
          );
        }

        const subtotal = Number(
          (item.cantidad * item.precio_unitario).toFixed(2),
        );

        const detalle = manager.create(DetalleCompra, {
          compra: compraGuardada,
          producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal,
        });

        await manager.save(detalle);

        producto.stock_actual += item.cantidad;

        await manager.save(producto);

        const movimiento = manager.create(Movimiento, {
          producto,
          tipo: 'entrada',
          cantidad: item.cantidad,
          motivo: `Compra #${compraGuardada.id}`,
          referencia_id: compraGuardada.id,
        });

        await manager.save(movimiento);

        totalCompra += subtotal;
      }

      compraGuardada.total = Number(totalCompra.toFixed(2));

      return manager.save(compraGuardada);
    });
  }


  // Listar compras
  findAll() {
    return this.dataSource.getRepository(Compra).find({
      relations: {
        proveedor: true,
      },
      order: {
        fecha: 'DESC',
      },
    });
  }

  // Buscar una compra por ID
  async findOne(id: number) {
    const compra = await this.dataSource.getRepository(Compra).findOne({
      where: { id },
      relations: {
        proveedor: true,
        detalles: {
          producto: true,
        },
      },
    });

    if (!compra) {
      throw new NotFoundException('Compra no encontrada');
    }

    return compra;
  }
}
