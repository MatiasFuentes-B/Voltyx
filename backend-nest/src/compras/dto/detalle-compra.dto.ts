import {
  IsInt,
  IsNumber,
  Min,
} from 'class-validator';

export class DetalleCompraDto {
  @IsInt()
  @Min(1)
  producto_id: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_unitario: number;
}
