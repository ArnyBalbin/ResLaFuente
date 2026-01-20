import { IsNumber, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MetodoPago } from '@prisma/client';
export class CreatePagoDto {
  @IsNumber()
  @IsNotEmpty()
  pedidoId: number;

  @IsNumber()
  @IsNotEmpty()
  cajaId: number;

  @IsEnum(MetodoPago)
  @IsNotEmpty()
  metodo: MetodoPago;

  @IsNumber()
  @IsNotEmpty()
  monto: number;

  @IsString()
  @IsOptional()
  codigoOperacion?: string;
}