
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import type { Relation } from 'typeorm';

import { Proveedor } from '../../proveedores/entities/proveedor.entity.js';
import { DetalleCompra } from './detalle-compra.entity.js';

@Entity('compras')
export class Compra {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Proveedor, {
    nullable: true,
    onDelete: 'SET NULL',
  })

  @JoinColumn({ name: 'proveedor_id' })
  proveedor: Proveedor | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ default: 'recibida' })
  estado: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({ type: 'text', nullable: true })
  nota: string;

  @OneToMany(() => DetalleCompra, (detalle) => detalle.compra)
  detalles: Relation<DetalleCompra[]>;
}
