
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
  create(
    @Body()
    datos: {
      nombre: string;
      contacto?: string;
      telefono?: string;
      email?: string;
      direccion?: string;
    },
  ) {
    return this.proveedoresService.create(datos);
  }

  // Actualizar proveedor
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    datos: {
      nombre?: string;
      contacto?: string;
      telefono?: string;
      email?: string;
      direccion?: string;
    },
  ) {
    return this.proveedoresService.update(id, datos);
  }

  // Eliminar proveedor
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.remove(id);
  }
}
