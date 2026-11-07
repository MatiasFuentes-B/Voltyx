import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  EventoInventario,
  EventoInventarioDocument,
} from './schemas/evento-inventario.schema.js';

@Injectable()
export class EventosInventarioService {
  constructor(
    @InjectModel(EventoInventario.name)
    private readonly eventoModel: Model<EventoInventarioDocument>,
  ) {}

  async registrar(datos: Partial<EventoInventario>) {
    const evento = new this.eventoModel(datos);
    return evento.save();
  }

  async obtenerTodos() {
    return this.eventoModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }
}