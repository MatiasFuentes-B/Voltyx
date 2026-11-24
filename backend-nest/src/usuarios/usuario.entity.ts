import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ length: 150, unique: true })
  email!: string;

  @Column({ length: 255, select: false })
  password_hash!: string;

  @Column({ length: 30, default: 'usuario' })
  rol!: string;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  creado_en!: Date;
}
