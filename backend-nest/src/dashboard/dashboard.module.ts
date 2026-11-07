import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { Producto } from '../productos/entities/producto.entity.js';
import { Compra } from '../compras/entities/compra.entity.js';
import { Movimiento } from '../movimientos/entities/movimiento.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, Compra, Movimiento]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}