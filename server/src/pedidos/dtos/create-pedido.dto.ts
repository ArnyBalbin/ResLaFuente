import { 
  IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, 
  IsString, IsUUID, Min, ValidateNested, ArrayMinSize 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoPedido } from '@prisma/client';

export class CreateDetallePedidoDto {
  @ApiPropertyOptional({ example: '550e8400-e29b...', description: 'ID del Producto (Si es un ítem individual)' })
  @IsUUID('4')
  @IsOptional()
  productoId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b...', description: 'ID del Menú (Si es un combo completo)' })
  @IsUUID('4')
  @IsOptional()
  menuId?: string;

  @ApiProperty({ example: 2, description: 'Cantidad solicitada' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  cantidad!: number;

  @ApiProperty({ example: 25.50, description: 'Precio unitario congelado al momento del pedido' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  precioUnitario!: number;

  @ApiPropertyOptional({ example: 'Sin cebolla, bien cocido', description: 'Instrucciones para cocina' })
  @IsString()
  @IsOptional()
  notas?: string;
}

export class CreatePedidoDto {
  @ApiPropertyOptional({ example: '550e8400-e29b...', description: 'ID de la cuenta personal del cliente' })
  @IsUUID('4')
  @IsOptional()
  clienteId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b...', description: 'ID del convenio B2B del trabajador' })
  @IsUUID('4')
  @IsOptional()
  convenioId?: string;

  @ApiProperty({ enum: TipoPedido, default: TipoPedido.MESA })
  @IsEnum(TipoPedido)
  @IsNotEmpty()
  tipo!: TipoPedido;

  @ApiPropertyOptional({ example: 'Av. Larco 123', description: 'Requerido si el tipo es DELIVERY' })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiPropertyOptional({ type: [String], description: 'Arreglo de IDs de mesas a ocupar (Para salón)' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  mesasIds?: string[];

  @ApiProperty({ type: [CreateDetallePedidoDto], description: 'Lista de productos o menús solicitados' })
  @IsArray()
  @ArrayMinSize(1, { message: 'El pedido debe contener al menos un detalle' })
  @ValidateNested({ each: true })
  @Type(() => CreateDetallePedidoDto)
  @IsNotEmpty()
  detalles!: CreateDetallePedidoDto[];
}