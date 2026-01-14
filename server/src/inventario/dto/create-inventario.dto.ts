import { IsInt, IsEnum, IsPositive, IsString, IsNotEmpty, IsOptional } from 'class-validator';

enum TipoMovimiento {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE'
}

export class CreateInventarioDto {
  @IsInt()
  @IsNotEmpty()
  productoId: number;

  @IsEnum(TipoMovimiento)
  @IsNotEmpty()
  tipo: TipoMovimiento;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  cantidad: number;

  @IsString()
  @IsOptional()
  motivo?: string;
}