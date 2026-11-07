
import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsIn,
} from 'class-validator';

export class CrearMovimientoDto {
  @IsInt()
  @IsNotEmpty()
  producto_id: number;

  @IsString()
  @IsIn(['entrada', 'salida', 'ajuste'])
  tipo: string;

  @IsInt()
  @IsNotEmpty()
  cantidad: number;

  @IsString()
  @IsNotEmpty()
  motivo: string;
}
