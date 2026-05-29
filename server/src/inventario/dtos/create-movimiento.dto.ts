import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoMovimiento } from '@prisma/client';

export class CreateMovimientoDto {
  @ApiProperty({ example: '550e8400-e29b...', description: 'ID del Producto afectado' })
  @IsUUID('4')
  @IsNotEmpty()
  productoId!: string;

  @ApiProperty({ enum: TipoMovimiento, description: 'ENTRADA (Compras), SALIDA (Mermas/Consumo), AJUSTE (Cuadre de inventario)' })
  @IsEnum(TipoMovimiento)
  @IsNotEmpty()
  tipo!: TipoMovimiento;

  @ApiProperty({ example: 50, description: 'Cantidad a sumar o restar. Para SALIDA o AJUSTE negativo, usar valores negativos.' })
  @IsInt()
  @IsNotEmpty()
  cantidad!: number;

  @ApiPropertyOptional({ example: 'Compra de cervezas a proveedor Backus', description: 'Justificación obligatoria para ajustes o mermas' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  motivo?: string;

  @ApiPropertyOptional({ example: 4.50, description: 'Costo unitario de adquisición al momento de la entrada' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  costoUnitario?: number;
}