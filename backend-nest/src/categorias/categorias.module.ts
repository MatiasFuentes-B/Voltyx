import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasController } from './categorias.controller.js';
import { CategoriasService } from './categorias.service.js';
import { Categoria } from './entities/categoria.entity.js';
import { EventosInventarioModule } from '../eventos-inventario/eventos-inventario.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria]), EventosInventarioModule],
  controllers: [CategoriasController],
  providers: [CategoriasService],
  exports: [TypeOrmModule],
})
export class CategoriasModule {}
