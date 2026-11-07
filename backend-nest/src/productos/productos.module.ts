import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductosController } from './productos.controller.js';
import { ProductosService } from './productos.service.js';
import { Producto } from './entities/producto.entity.js';
import { Categoria } from '../categorias/entities/categoria.entity.js';
import { Movimiento } from '../movimientos/entities/movimiento.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, Categoria, Movimiento])],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
