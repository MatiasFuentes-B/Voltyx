import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventoInventarioDocument =
  HydratedDocument<EventoInventario>;

@Schema({ timestamps: true })
export class EventoInventario {
  @Prop({
    required: true,
    enum: [
      'compra',
      'entrada',
      'salida',
      'ajuste',
      'producto_creado',
      'producto_modificado',
      'producto_desactivado',
      'categoria_creada',
      'categoria_modificada',
      'categoria_eliminada',
      'proveedor_creado',
      'proveedor_modificado',
      'proveedor_eliminado',
    ],
  })
  tipoEvento: string;

  @Prop()
  productoId?: number;

  @Prop()
  productoNombre?: string;

  @Prop()
  cantidad?: number;

  @Prop()
  stockAnterior?: number;

  @Prop()
  stockNuevo?: number;

  @Prop()
  motivo?: string;

  @Prop()
  referenciaId?: number;

  @Prop()
  entidadId?: number;

  @Prop()
  entidadNombre?: string;

  @Prop()
  descripcion?: string;

  @Prop({ type: Object })
  detalles?: Record<string, unknown>;
}

export const EventoInventarioSchema =
  SchemaFactory.createForClass(EventoInventario);
