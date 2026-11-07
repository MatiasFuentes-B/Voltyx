import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';

export class ActualizarProductoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoria_id?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio_compra?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  precio_venta?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock_minimo?: number;
}
