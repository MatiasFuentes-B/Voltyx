
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';

import { Proveedor } from '../../proveedores/entities/proveedor.entity.js';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Proveedor, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ default: 'recibida' })
  estado: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true })
  nota: string;
}
