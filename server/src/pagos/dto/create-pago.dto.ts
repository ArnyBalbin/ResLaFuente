import { IsNumber, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  YAPE_PLIN = 'YAPE_PLIN',
  TARJETA = 'TARJETA',
  CREDITO_EMPRESA = 'CREDITO_EMPRESA',
}

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