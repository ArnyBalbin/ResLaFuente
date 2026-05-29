import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CerrarCajaDto {
  @ApiProperty({ example: 850.50, description: 'Dinero físico total contado por el cajero (Cierre Ciego)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El monto final contado no puede ser negativo' })
  @IsNotEmpty()
  montoFinal!: number;

  @ApiPropertyOptional({ example: 'Se gastó 20 soles en pasajes para el delivery', description: 'Justificación opcional del cajero' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  observaciones?: string;
}