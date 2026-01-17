import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsBoolean, 
  IsEnum, 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  ValidateNested, 
  Min,
  ValidateIf
} from 'class-validator';
import { TipoPedido } from '@prisma/client';

export class DetallePedidoItemDto {
  @IsInt()
  productoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => DetallePedidoItemDto)
  componentes?: DetallePedidoItemDto[]; 
}

export class CreatePedidoDto {
  @IsInt()
  usuarioId: number;

  @IsEnum(TipoPedido)
  tipo: TipoPedido;

  @ValidateIf(o => o.tipo === 'MESA')
  @IsInt()
  @IsNotEmpty({ message: 'El ID de mesa es obligatorio para pedidos en mesa' })
  mesaId?: number;

  @IsInt()
  @IsOptional()
  clienteId?: number;

  @IsBoolean()
  esCredito: boolean;

  @ValidateIf(o => o.esCredito === true)
  @IsInt()
  @IsNotEmpty({ message: 'Si es venta a crédito, debe especificar la empresa' })
  empresaId?: number;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetallePedidoItemDto)
  items: DetallePedidoItemDto[];
}