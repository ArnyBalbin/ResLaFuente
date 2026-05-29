import { IsNotEmpty, IsString, IsUUID, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginPosDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID del Tenant/Sucursal configurado en la tablet' })
  @IsUUID('4', { message: 'El ID de la sucursal debe ser un UUID válido' })
  @IsNotEmpty()
  sucursalId!: string;

  @ApiProperty({ example: '1234', description: 'PIN de acceso rápido de 4 dígitos' })
  @IsString()
  @Length(4, 4, { message: 'El PIN debe tener exactamente 4 dígitos' })
  @Matches(/^[0-9]{4}$/, { message: 'El PIN solo puede contener números' })
  @IsNotEmpty()
  pinAcceso!: string;
}