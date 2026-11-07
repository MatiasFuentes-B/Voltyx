import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';

import { ComprasService } from './compras.service.js';

import { CrearCompraDto } from './dto/crear-compra.dto.js';

@Controller('compras')
export class ComprasController {
  constructor(
    private readonly comprasService: ComprasService,
  ) {}

  // Listar compras
  @Get()
  findAll() {
    return this.comprasService.findAll();
  }

  // Buscar compra por ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.findOne(id);
  }

  // Registrar compra
  @Post()
  create(@Body() datos: CrearCompraDto) {
    return this.comprasService.create(datos);
  }

    // Anular compra
  @Post(':id/anular')
  anular(@Param('id', ParseIntPipe) id: number) {
    return this.comprasService.anular(id);
  }
}
