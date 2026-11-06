
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    ParseIntPipe,
 } from '@nestjs/common';

import { ProductosService } from './productos.service.js';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('categoria_id') categoria_id?: string,
    @Query('bajo_stock') bajo_stock?: string,
  ) {
    return this.productosService.findAll(
      q,
      categoria_id ? Number(categoria_id) : undefined,
      bajo_stock === 'true',
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Post()
    create(@Body() datos: {
        nombre: string;
        descripcion?: string;
        codigo?: string;
        categoria_id?: number;
        precio_compra?: number;
        precio_venta?: number;
        stock_actual?: number;
        stock_minimo?: number;
    }) {
  return this.productosService.create(datos);
    }
}
