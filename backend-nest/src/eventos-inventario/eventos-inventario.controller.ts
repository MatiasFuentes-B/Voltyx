import { Controller, Get } from '@nestjs/common';
import { EventosInventarioService } from './eventos-inventario.service.js';

@Controller('eventos-inventario')
export class EventosInventarioController {
  constructor(
    private readonly eventosInventarioService: EventosInventarioService,
  ) {}

  @Get()
  obtenerTodos() {
    return this.eventosInventarioService.obtenerTodos();
  }
}