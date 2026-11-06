
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ComprasController } from './compras.controller.js';
import { ComprasService } from './compras.service.js';
import { Compra } from './entities/compra.entity.js';
import { DetalleCompra } from './entities/detalle-compra.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Compra, DetalleCompra])],
  controllers: [ComprasController],
  providers: [ComprasService],
})
export class ComprasModule {}
