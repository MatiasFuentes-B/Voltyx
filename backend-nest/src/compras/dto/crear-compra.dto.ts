
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';
import { DetalleCompraDto } from './detalle-compra.dto.js';

export class CrearCompraDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  proveedor_id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nota?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => DetalleCompraDto)
  productos: DetalleCompraDto[];
}
