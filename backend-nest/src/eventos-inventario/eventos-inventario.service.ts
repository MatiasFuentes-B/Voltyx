import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  EventoInventario,
  EventoInventarioDocument,
} from './schemas/evento-inventario.schema.js';

@Injectable()
export class EventosInventarioService {
  private readonly logger = new Logger(EventosInventarioService.name);
  constructor(
    @InjectModel(EventoInventario.name)
    private readonly eventoModel: Model<EventoInventarioDocument>,
  ) {}

 async registrar(datos: Partial<EventoInventario>) {
  try {
    const evento = new this.eventoModel(datos);
    return await evento.save();
  } catch (error) {
    this.logger.error(
      'No se pudo registrar el evento en MongoDB',
      error instanceof Error ? error.stack : String(error),
    );
    return null;
  }
}

async obtenerTodos() {
  return this.eventoModel
    .find()
    .sort({ createdAt: -1 })
    .exec();
}}