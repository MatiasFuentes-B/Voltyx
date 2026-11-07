
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MovimientosController } from './movimientos.controller.js';
import { MovimientosService } from './movimientos.service.js';
import { Movimiento } from './entities/movimiento.entity.js';
import { EventosInventarioModule } from '../eventos-inventario/eventos-inventario.module.js';

@Module({
  imports: [
    EventosInventarioModule,
    TypeOrmModule.forFeature([Movimiento])
  ],
  controllers: [MovimientosController],
  providers: [MovimientosService],
})
export class MovimientosModule {}
