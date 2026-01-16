import { IsInt, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsString, Min, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoPedido {
  MESA = 'MESA',
  LLEVAR = 'LLEVAR',
  DELIVERY = 'DELIVERY',
}

class DetallePedidoDto {
  @IsInt()
  productoId: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsString()
  @IsOptional()
  notas?: string;
}

export class CreatePedidoDto {

  @IsInt()
  @IsOptional()
  mesaId?: number;

  @IsInt()
  @IsNotEmpty()
  usuarioId: number;

  @IsInt()
  @IsOptional()
  clienteId?: number;

  @IsOptional()
  @IsEnum(TipoPedido)
  tipo?: TipoPedido;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsBoolean()
  esCredito?: boolean;

  @IsOptional()
  @IsInt()
  empresaId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetallePedidoDto)
  detalles: DetallePedidoDto[];
}