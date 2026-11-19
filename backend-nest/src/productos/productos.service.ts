import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { Movimiento } from '../movimientos/entities/movimiento.entity.js';
import { Categoria } from '../categorias/entities/categoria.entity.js';
import { Producto } from './entities/producto.entity.js';
import { EventosInventarioService } from '../eventos-inventario/eventos-inventario.service.js';
import { CrearProductoDto } from './dto/crear-producto.dto.js';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto.js';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    private dataSource: DataSource,
    private eventosInventarioService: EventosInventarioService,
  ) {}

  async findAll(q?: string, categoria_id?: number, bajo_stock?: boolean) {
    const query = this.productosRepository
      .createQueryBuilder('producto')
      .leftJoinAndSelect('producto.categoria', 'categoria')
      .where('producto.activo = :activo', { activo: true });

    if (q) {
      query.andWhere(
        '(producto.nombre LIKE :q OR producto.codigo LIKE :q)',
        { q: `%${q}%` },
      );
    }

    if (categoria_id) {
      query.andWhere('producto.categoria_id = :categoria_id', {
        categoria_id,
      });
    }

    if (bajo_stock) {
      query.andWhere('producto.stock_actual <= producto.stock_minimo');
    }

    return query.orderBy('producto.nombre', 'ASC').getMany();
  }

  async findOne(id: number) {
    const producto = await this.productosRepository.findOne({
      where: { id, activo: true },
      relations: {
        categoria: true,
      },
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async create(datos: CrearProductoDto) {

  const productoGuardado = await this.dataSource.transaction(async (manager) => {
    const productosRepository = manager.getRepository(Producto);
    const movimientosRepository = manager.getRepository(Movimiento);
    const categoriasRepository = manager.getRepository(Categoria);

    const stockInicial = datos.stock_actual ?? 0;

let categoria: Categoria | null = null;

    if (datos.categoria_id !== undefined) {
        const categoriaEncontrada = await categoriasRepository.findOne({
            where: { id: datos.categoria_id },
  });

  if (!categoriaEncontrada) {
    throw new NotFoundException('Categoría no encontrada');
  }

  categoria = categoriaEncontrada;
}

    const producto = productosRepository.create({
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      codigo: datos.codigo,
      categoria: categoria,
      precio_compra: datos.precio_compra ?? 0,
      precio_venta: datos.precio_venta ?? 0,
      stock_actual: stockInicial,
      stock_minimo: datos.stock_minimo ?? 0,
    });

    const productoGuardado = await productosRepository.save(producto);

    if (stockInicial > 0) {
      const movimiento = movimientosRepository.create({
        producto: productoGuardado,
        tipo: 'entrada',
        cantidad: stockInicial,
        motivo: 'Stock inicial',
      });

      await movimientosRepository.save(movimiento);
    }

    return productoGuardado;
  });

await this.eventosInventarioService.registrar({
    tipoEvento: 'producto_creado',
    entidadId: productoGuardado.id,
    entidadNombre: productoGuardado.nombre,
    descripcion: 'Se creó un producto',
    detalles: {
      precioCompra: productoGuardado.precio_compra,
      precioVenta: productoGuardado.precio_venta,
      stockInicial: productoGuardado.stock_actual,
    },
  });

  return productoGuardado;
}

async update(id: number, datos: ActualizarProductoDto) {

  const producto = await this.productosRepository.findOne({
    where: { id, activo: true },
  });

  if (!producto) {
    throw new NotFoundException('Producto no encontrado');
  }

  if (datos.nombre !== undefined) {
    producto.nombre = datos.nombre;
  }

  if (datos.descripcion !== undefined) {
    producto.descripcion = datos.descripcion;
  }

  if (datos.codigo !== undefined) {
    producto.codigo = datos.codigo;
  }

  if (datos.categoria_id !== undefined) {
    if (datos.categoria_id === null) {
        producto.categoria = null;
    }   else {
        const categoria = await this.dataSource
            .getRepository(Categoria)
            .findOne({
                where: { id: datos.categoria_id },
            });

        if (!categoria) {
            throw new NotFoundException('Categoría no encontrada');
        }

        producto.categoria = categoria;
    }
  }

  if (datos.precio_compra !== undefined) {
    producto.precio_compra = datos.precio_compra;
  }

  if (datos.precio_venta !== undefined) {
    producto.precio_venta = datos.precio_venta;
  }

  if (datos.stock_minimo !== undefined) {
    producto.stock_minimo = datos.stock_minimo;
  }

  const productoActualizado = await this.productosRepository.save(producto);

  const cambios = Object.fromEntries(
    Object.entries(datos).filter(
      ([, valor]) => valor !== undefined,
    ),
  );
  
  await this.eventosInventarioService.registrar({
    tipoEvento: 'producto_modificado',
    entidadId: productoActualizado.id,
    entidadNombre: productoActualizado.nombre,
    descripcion: 'Se modificó un producto',
    detalles: {
      camposModificados: Object.keys(cambios),
      cambios: cambios,
    },
  });

return productoActualizado;
}

async remove(id: number) {
  const producto = await this.productosRepository.findOne({
    where: { id, activo: true },
  });

  if (!producto) {
    throw new NotFoundException('Producto no encontrado');
  }

 producto.activo = false;

const productoDesactivado = await this.productosRepository.save(producto);

await this.eventosInventarioService.registrar({
  tipoEvento: 'producto_desactivado',
  entidadId: productoDesactivado.id,
  entidadNombre: productoDesactivado.nombre,
  descripcion: 'Se desactivó un producto',
});

return productoDesactivado;
}}