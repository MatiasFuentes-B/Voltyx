import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CrearCompraDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  proveedor_id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nota?: string;

  @IsNotEmpty()
  productos: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}
