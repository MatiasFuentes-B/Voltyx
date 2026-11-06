import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseIntPipe,
 } from '@nestjs/common';

import { ProductosService } from './productos.service.js';
import { CrearProductoDto } from './dto/crear-producto.dto.js';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto.js';

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
  create(@Body() datos: CrearProductoDto) {
    return this.productosService.create(datos);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarProductoDto,
  ) {
    return this.productosService.update(id, datos);
  }

  @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {

  return this.productosService.remove(id);
}

}
