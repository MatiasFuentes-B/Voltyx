import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  EventoInventario,
  EventoInventarioSchema,
} from './schemas/evento-inventario.schema.js';

import { EventosInventarioService } from './eventos-inventario.service.js';
import { EventosInventarioController } from './eventos-inventario.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: EventoInventario.name,
        schema: EventoInventarioSchema,
      },
    ]),
  ],
  controllers: [EventosInventarioController],
  providers: [EventosInventarioService],
  exports: [EventosInventarioService],
  
})
export class EventosInventarioModule {}