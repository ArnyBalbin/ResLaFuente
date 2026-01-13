import { IsString, IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

enum Rol {
  ADMIN = 'ADMIN',
  MOZO = 'MOZO',
  COCINA = 'COCINA',
  CAJA = 'CAJA',
}

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(Rol)
  @IsOptional()
  rol?: Rol; // Si no envían rol, será MOZO por defecto (según el schema)
}