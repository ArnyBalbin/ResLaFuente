import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGastoDto {
  @ApiProperty({ example: 'Compra de 10kg de carne y verduras', description: 'Concepto detallado' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  descripcion!: string;

  @ApiProperty({ example: 150.50, description: 'Monto del egreso' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  monto!: number;

  @ApiProperty({ example: '550e8400-e29b...', description: 'ID de la CategoriaGasto' })
  @IsUUID('4')
  @IsNotEmpty()
  categoriaId!: string;

  @ApiPropertyOptional({ example: '550e8400-e29b...', description: 'ID de la Caja si el dinero salió del cajón del turno' })
  @IsUUID('4')
  @IsOptional()
  cajaId?: string;
}