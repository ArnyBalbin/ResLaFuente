import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AbrirCajaDto {
  @ApiProperty({ example: 150.00, description: 'Sencillo o fondo inicial de caja (Base)' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El monto inicial no puede ser negativo' })
  @IsNotEmpty()
  montoInicial!: number;
}