
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  RelationId
} from 'typeorm';

import { Categoria } from '../../categorias/entities/categoria.entity.js';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ unique: true, nullable: true })
  codigo: string;

  @ManyToOne(() => Categoria, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria | null;

  @RelationId((producto: Producto) => producto.categoria)
  categoria_id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio_compra: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precio_venta: number;

  @Column({ default: 0 })
  stock_actual: number;

  @Column({ default: 0 })
  stock_minimo: number;

  @Column({ default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'creado_en', type: 'datetime' })
  creado_en: Date;
}
