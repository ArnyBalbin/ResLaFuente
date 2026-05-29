import { 
  IsArray, IsNotEmpty, IsNumber, IsOptional, 
  IsString, IsUUID, MaxLength, Min 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Menú Ejecutivo', description: 'Nombre del menú' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ example: 15.00, description: 'Precio total del menú (entrada + segundo)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  precio!: number;

  @ApiProperty({ example: '550e8400-e29b...', description: 'ID del Producto que será el Plato Principal (Segundo)' })
  @IsUUID('4')
  @IsNotEmpty()
  segundoId!: string;

  @ApiPropertyOptional({ 
    type: [String], 
    description: 'Arreglo de IDs de Productos que serán las Entradas' 
  })
  @IsArray()
  @IsUUID('4', { each: true, message: 'Cada entrada debe ser un UUID válido' })
  @IsOptional()
  entradas?: string[];
}