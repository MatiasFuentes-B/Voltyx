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
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';

@Injectable()
export class ComprasService {
  constructor(
    private dataSource: DataSource,
    private eventosInventarioService: EventosInventarioService,
  ) {}


  // Registrar una compra
  async create(datos: CrearCompraDto) {
    const resultado = await this.dataSource.transaction(async (manager) => {
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

      const eventos: Array<{
        tipoEvento: 'compra';
        productoId: number;
        productoNombre: string;
        cantidad: number;
        stockAnterior: number;
        stockNuevo: number;
        motivo: string;
        referenciaId: number;
      }> = [];

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

        const stockAnterior = producto.stock_actual;

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

        const stockNuevo = producto.stock_actual;

        const movimiento = manager.create(Movimiento, {
          producto,
          tipo: 'entrada',
          cantidad: item.cantidad,
          motivo: `Compra #${compraGuardada.id}`,
          referencia_id: compraGuardada.id,
        });

        await manager.save(movimiento);

        eventos.push({
          tipoEvento: 'compra',
          productoId: producto.id,
          productoNombre: producto.nombre,
          cantidad: item.cantidad,
          stockAnterior,
          stockNuevo,
          motivo: `Compra #${compraGuardada.id}`,
          referenciaId: compraGuardada.id,
        });

        totalCompra += subtotal;
      }

      compraGuardada.total = Number(totalCompra.toFixed(2));

      const compraFinal = await manager.save(compraGuardada);

      return {
        compra: compraFinal,
        eventos,
      };
    });

    // Registrar los eventos en MongoDB después de confirmar MySQL
    for (const evento of resultado.eventos) {
      await this.eventosInventarioService.registrar(evento);
    }

    return resultado.compra;
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

  
  // Anular una compra
  async anular(id: number) {
    const resultado = await this.dataSource.transaction(async (manager) => {
      const compra = await manager.findOne(Compra, {
        where: { id },
        relations: {
          detalles: {
            producto: true,
          },
        },
      });

      if (!compra) {
        throw new NotFoundException('Compra no encontrada');
      }

      if (compra.estado === 'anulada') {
        throw new BadRequestException('La compra ya está anulada');
      }

      const eventos: Array<{
        tipoEvento: 'salida';
        productoId: number;
        productoNombre: string;
        cantidad: number;
        stockAnterior: number;
        stockNuevo: number;
        motivo: string;
        referenciaId: number;
      }> = [];

      for (const detalle of compra.detalles) {
        const producto = await manager.findOne(Producto, {
          where: { id: detalle.producto.id },
        });

        if (!producto) {
          throw new NotFoundException('Producto de la compra no encontrado');
        }

        if (producto.stock_actual < detalle.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para anular la compra del producto ${producto.nombre}`,
          );
        }

        const stockAnterior = producto.stock_actual;

        producto.stock_actual -= detalle.cantidad;

        await manager.save(producto);

        const stockNuevo = producto.stock_actual;

        const movimiento = manager.create(Movimiento, {
          producto,
          tipo: 'salida',
          cantidad: detalle.cantidad,
          motivo: `Anulación compra #${compra.id}`,
          referencia_id: compra.id,
        });

        await manager.save(movimiento);

        eventos.push({
          tipoEvento: 'salida',
          productoId: producto.id,
          productoNombre: producto.nombre,
          cantidad: detalle.cantidad,
          stockAnterior,
          stockNuevo,
          motivo: `Anulación compra #${compra.id}`,
          referenciaId: compra.id,
        });
      }

      compra.estado = 'anulada';

      const compraAnulada = await manager.save(compra);

      return {
        compra: compraAnulada,
        eventos,
      };
    });

    // Registrar eventos en MongoDB después de confirmar MySQL
    for (const evento of resultado.eventos) {
      await this.eventosInventarioService.registrar(evento);
    }

    return resultado.compra;
  }


}
