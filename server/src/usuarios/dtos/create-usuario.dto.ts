import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Rol } from '@prisma/client';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Carlos Mendoza', description: 'Nombre completo del colaborador' })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre!: string;

  @ApiProperty({ example: 'carlos@lafuente.com' })
  @IsEmail({}, { message: 'Formato de correo electrónico inválido' })
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ example: '+51987654321', description: 'Teléfono de contacto del usuario' })
  @IsString()
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña para acceso web (Backoffice)' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: '1234', description: 'PIN de 4 dígitos para acceso rápido en tablets POS' })
  @IsString()
  @Length(4, 4, { message: 'El PIN debe tener exactamente 4 dígitos' })
  @Matches(/^[0-9]{4}$/, { message: 'El PIN solo puede contener números' })
  @IsNotEmpty()
  pinAcceso!: string;

  @ApiPropertyOptional({ enum: Rol, default: Rol.MOZO })
  @IsEnum(Rol, { message: 'El rol proporcionado no es válido' })
  @IsOptional()
  rol?: Rol;
}