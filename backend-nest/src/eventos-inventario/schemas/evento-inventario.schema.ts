import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventoInventarioDocument =
  HydratedDocument<EventoInventario>;

@Schema({ timestamps: true })
export class EventoInventario {
  @Prop({
    required: true,
    enum: ['compra', 'entrada', 'salida', 'ajuste'],
  })
  tipoEvento: string;

  @Prop({ required: true })
  productoId: number;

  @Prop({ required: true })
  productoNombre: string;

  @Prop({ required: true })
  cantidad: number;

  @Prop({ required: true })
  stockAnterior: number;

  @Prop({ required: true })
  stockNuevo: number;

  @Prop()
  motivo?: string;

  @Prop()
  referenciaId?: number;
}

export const EventoInventarioSchema =
  SchemaFactory.createForClass(EventoInventario);