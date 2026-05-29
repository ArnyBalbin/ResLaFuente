import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoriaGastoDto {
  @ApiProperty({ example: 'Compras de Mercado', description: 'Nombre de la cuenta contable' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiPropertyOptional({ example: true, description: 'True: Costo Directo (Insumos). False: Gasto Operativo (Luz, Sueldos)' })
  @IsBoolean()
  @IsOptional()
  esCosto?: boolean;
}