
import {
  Controller,
  Get,
  Post,
  Body,
} from '@nestjs/common';

import { MovimientosService } from './movimientos.service.js';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto.js';

@Controller('movimientos')
export class MovimientosController {
  constructor(
    private readonly movimientosService: MovimientosService,
  ) {}

  // Listar movimientos
  @Get()
  findAll() {
    return this.movimientosService.findAll();
  }

  // Registrar movimiento
  @Post()
  create(@Body() datos: CrearMovimientoDto) {
    return this.movimientosService.create(datos);
  }
}
