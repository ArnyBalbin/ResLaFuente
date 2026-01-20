import { IsNumber, IsNotEmpty, Min, IsOptional, IsString } from 'class-validator';

export class AbrirCajaDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  montoInicial: number;

  @IsNumber()
  @IsNotEmpty()
  usuarioId: number;
}

export class CerrarCajaDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  montoFinal: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}