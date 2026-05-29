import { 
  IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, 
  IsString, IsUUID, Min, ValidateNested, ArrayMinSize 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetodoPago } from '@prisma/client';

export class DetallePagoDto {
  @ApiProperty({ enum: MetodoPago, description: 'Método utilizado para esta fracción del pago' })
  @IsEnum(MetodoPago)
  @IsNotEmpty()
  metodo!: MetodoPago;

  @ApiProperty({ example: 10.00, description: 'Monto a cobrar por este método' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  monto!: number;

  @ApiPropertyOptional({ example: '000123', description: 'Nro de operación si es Yape/Plin o Tarjeta' })
  @IsString()
  @IsOptional()
  codigoOperacion?: string;
}

export class ProcesarPagoDto {
  @ApiProperty({ example: '550e8400-e29b...', description: 'ID del pedido que se está cobrando' })
  @IsUUID('4')
  @IsNotEmpty()
  pedidoId!: string;

  @ApiProperty({ type: [DetallePagoDto], description: 'Arreglo de pagos (Soporta pagos mixtos)' })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe enviar al menos un método de pago' })
  @ValidateNested({ each: true })
  @Type(() => DetallePagoDto)
  @IsNotEmpty()
  pagos!: DetallePagoDto[];
}