import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearCategoriaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}
