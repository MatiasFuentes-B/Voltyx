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

import { ProveedoresService } from './proveedores.service.js';
import { ApiBody } from '@nestjs/swagger';
import { CrearProveedorDto } from './dto/crear-proveedor.dto.js';
import { ActualizarProveedorDto } from './dto/actualizar-proveedor.dto.js';

@Controller('proveedores')
export class ProveedoresController {
  constructor(
    private readonly proveedoresService: ProveedoresService,
  ) {}

  // Listar proveedores
  @Get()
  findAll() {
    return this.proveedoresService.findAll();
  }

  // Buscar proveedor por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.findOne(id);
  }

  // Crear proveedor
  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['nombre'],
      properties: {
        nombre: { type: 'string', example: 'Distribuidora Central' },
        contacto: { type: 'string', example: 'Juan Pérez' },
        telefono: { type: 'string', example: '912345678' },
        email: { type: 'string', example: 'contacto@empresa.cl' },
        direccion: { type: 'string', example: 'Santiago, Chile' },
      },
    },
  })
  create(@Body() datos: CrearProveedorDto) {
    return this.proveedoresService.create(datos);
  }

  // Actualizar proveedor
  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Distribuidora Central Actualizada' },
        contacto: { type: 'string', example: 'María Pérez' },
        telefono: { type: 'string', example: '987654321' },
        email: { type: 'string', example: 'nuevo@empresa.cl' },
        direccion: { type: 'string', example: 'Valparaíso, Chile' },
      },
    },
  })
  
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarProveedorDto
  ) {
    return this.proveedoresService.update(id, datos);
  }

  // Eliminar proveedor
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.remove(id);
  }
}
