import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Bebidas Calientes', description: 'Nombre de la categoría' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  nombre!: string;

  @ApiPropertyOptional({ example: 1, description: 'Orden de visualización en la tablet (POS)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  orden?: number;

  @ApiPropertyOptional({ example: '550e8400-e29b...', description: 'ID de la categoría padre (para subcategorías)' })
  @IsUUID('4', { message: 'El ID del padre debe ser un UUID válido' })
  @IsOptional()
  padreId?: string;
}