import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Compra } from './compra.entity.js';
import { Producto } from '../../productos/entities/producto.entity.js';

@Entity('detalle_compra')
export class DetalleCompra {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Compra, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'compra_id' })
  compra: Relation<Compra>;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column()
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio_unitario: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;
}
