import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { CategoriasService } from './categorias.service.js';
import { ApiBody } from '@nestjs/swagger';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  // Listar categorías
  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  // Buscar categoría por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.findOne(id);
  }

  // Crear categoría
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['nombre'],
      properties: {
        nombre: {
          type: 'string',
          example: 'Accesorios',
        },
        descripcion: {
          type: 'string',
          example: 'Categoría de accesorios tecnológicos',
        },
      },
    },
  })
  create(@Body() datos: { nombre: string; descripcion?: string }) {
    return this.categoriasService.create(datos);
  }

  // Actualizar categoría
  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: {
          type: 'string',
          example: 'Accesorios tecnológicos',
        },
        descripcion: {
          type: 'string',
          example: 'Categoría actualizada',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: { nombre?: string; descripcion?: string },
  ) {
    return this.categoriasService.update(id, datos);
  }
  // Eliminar categoría
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriasService.remove(id);
  }
}
