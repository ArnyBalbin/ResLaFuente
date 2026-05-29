import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSucursalDto {
  @ApiProperty({ example: 'La Fuente - Sede Central', description: 'Nombre comercial de la sucursal' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la sucursal es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre!: string;

  @ApiPropertyOptional({ example: 'Av. Víctor Larco Herrera 123, Trujillo', description: 'Dirección física del local' })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @IsOptional()
  @MaxLength(255, { message: 'La dirección no puede exceder los 255 caracteres' })
  direccion?: string;
}