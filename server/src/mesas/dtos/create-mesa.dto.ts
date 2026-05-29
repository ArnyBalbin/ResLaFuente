import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMesaDto {
  @ApiProperty({ example: '12', description: 'Número o identificador alfanumérico de la mesa' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  numero!: string;

  @ApiProperty({ example: 4, description: 'Cantidad máxima de comensales' })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  capacidad!: number;

  @ApiPropertyOptional({ example: 'Terraza', description: 'Zona o salón donde está ubicada' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  salon?: string;
}