import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProveedoresController } from './proveedores.controller.js';
import { ProveedoresService } from './proveedores.service.js';
import { Proveedor } from './entities/proveedor.entity.js';
import { EventosInventarioModule } from '../eventos-inventario/eventos-inventario.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor]), EventosInventarioModule],
  controllers: [ProveedoresController],
  providers: [ProveedoresService],
})
export class ProveedoresModule {}
