import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsEnum, 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  ValidateNested, 
  Min,
  ValidateIf,
  IsNumber
} from 'class-validator';
import { TipoPedido, MetodoPago } from '@prisma/client';

export class DetallePedidoItemDto {
  @IsInt()
  productoId!: number;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DetallePedidoItemDto)
  componentes?: DetallePedidoItemDto[]; 
}

export class PagoPedidoDto {
  @IsEnum(MetodoPago)
  metodo!: MetodoPago;

  @IsNumber()
  @Min(0.01)
  monto!: number;

  @IsInt()
  @IsOptional()
  cajaId?: number;
}

export class CreatePedidoDto {
  @IsInt()
  usuarioId!: number;

  @IsEnum(TipoPedido)
  tipo!: TipoPedido;

  @ValidateIf(o => o.tipo === 'MESA')
  @IsInt()
  @IsNotEmpty({ message: 'El ID de mesa es obligatorio para pedidos en mesa' })
  mesaId?: number;

  @IsInt()
  @IsOptional()
  clienteId?: number; // Obligatorio si hay pagos al crédito

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetallePedidoItemDto)
  items!: DetallePedidoItemDto[];

  // NUEVO: Array de pagos
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PagoPedidoDto)
  pagos?: PagoPedidoDto[];
}