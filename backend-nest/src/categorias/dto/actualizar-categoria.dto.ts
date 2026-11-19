import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ActualizarCategoriaDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
