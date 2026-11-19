
import {
  IsOptional,
  IsString,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';

export class ActualizarProveedorDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

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
