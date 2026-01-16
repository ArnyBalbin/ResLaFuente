import { IsString, IsEmail, IsNotEmpty, IsEnum, MinLength } from 'class-validator';

enum Rol {
  ADMIN = 'ADMIN',
  MOZO = 'MOZO',
  COCINA = 'COCINA',
  CAJA = 'CAJA',
}

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsEnum(Rol, { message: 'El rol debe ser uno de los siguientes: ADMIN, MOZO, COCINA, CAJA' })
  rol: Rol;
}