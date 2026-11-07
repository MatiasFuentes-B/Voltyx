import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Producto } from '../productos/entities/producto.entity.js';
import { Compra } from '../compras/entities/compra.entity.js';
import { Movimiento } from '../movimientos/entities/movimiento.entity.js';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,

    @InjectRepository(Compra)
    private readonly comprasRepository: Repository<Compra>,

    @InjectRepository(Movimiento)
    private readonly movimientosRepository: Repository<Movimiento>,
  ) {}

  async getDashboard() {
    const ahora = new Date();

    const inicioMes = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      1,
    );

    const inicioMesSiguiente = new Date(
      ahora.getFullYear(),
      ahora.getMonth() + 1,
      1,
    );

    const totalProductos = await this.productosRepository.count({
      where: { activo: true },
    });

    const productosBajoStock = await this.productosRepository
      .createQueryBuilder('producto')
      .where('producto.activo = :activo', { activo: true })
      .andWhere('producto.stock_actual <= producto.stock_minimo')
      .getCount();

    const valorInventario = await this.productosRepository
      .createQueryBuilder('producto')
      .select(
        'COALESCE(SUM(producto.stock_actual * producto.precio_compra), 0)',
        'valor',
      )
      .where('producto.activo = :activo', { activo: true })
      .getRawOne();

    const comprasMes = await this.comprasRepository
      .createQueryBuilder('compra')
      .select('COALESCE(SUM(compra.total), 0)', 'total')
      .where('compra.fecha >= :inicio', { inicio: inicioMes })
      .andWhere('compra.fecha < :fin', { fin: inicioMesSiguiente })
      .andWhere('compra.estado = :estado', { estado: 'recibida' })
      .getRawOne();

    const alertasReposicion = await this.productosRepository
      .createQueryBuilder('producto')
      .select([
        'producto.id',
        'producto.nombre',
        'producto.codigo',
        'producto.stock_actual',
        'producto.stock_minimo',
      ])
      .where('producto.activo = :activo', { activo: true })
      .andWhere('producto.stock_actual <= producto.stock_minimo')
      .orderBy('producto.stock_actual', 'ASC')
      .getMany();

    const ultimosMovimientos = await this.movimientosRepository.find({
      relations: { producto: true },
      order: { fecha: 'DESC' },
      take: 5,
    });

    return {
      total_productos: totalProductos,
      productos_bajo_stock: productosBajoStock,
      valor_inventario: Number(valorInventario?.valor ?? 0),
      compras_mes_total: Number(comprasMes?.total ?? 0),

      alertas_reposicion: alertasReposicion.map((producto) => ({
        id: producto.id,
        nombre: producto.nombre,
        codigo: producto.codigo,
        stock_actual: producto.stock_actual,
        stock_minimo: producto.stock_minimo,
      })),

      ultimos_movimientos: ultimosMovimientos.map((movimiento) => ({
        id: movimiento.id,
        producto_nombre: movimiento.producto?.nombre ?? 'Producto no disponible',
        tipo: movimiento.tipo,
        cantidad: movimiento.cantidad,
        fecha: movimiento.fecha,
      })),
    };
  }
}