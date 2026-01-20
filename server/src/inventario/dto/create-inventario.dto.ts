import { IsInt, IsEnum, IsPositive, IsString, IsNotEmpty, IsOptional, ValidateIf, IsNumber } from 'class-validator';
import { TipoMovimiento } from '@prisma/client';

export class CreateInventarioDto {
  @IsInt()
  @IsPositive()
  productoId: number;

  @IsEnum(TipoMovimiento, { 
    message: 'El tipo debe ser ENTRADA, SALIDA o AJUSTE' 
  })
  tipo: TipoMovimiento;

  @IsInt()
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;

  @IsString()
  @IsOptional()
  motivo?: string;

  @ValidateIf(o => o.tipo === 'ENTRADA')
  @IsNumber()
  @IsPositive()
  costoUnitario?: number;
}