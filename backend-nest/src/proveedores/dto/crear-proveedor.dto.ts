
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
} from 'class-validator';

export class CrearProveedorDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  contacto?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  direccion?: string;
}
