import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminDto {
  @ApiProperty({ example: 'admin@lafuente.com' })
  @IsEmail({}, { message: 'El formato del correo es inválido' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'passwordSeguro123' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty()
  password!: string;
}