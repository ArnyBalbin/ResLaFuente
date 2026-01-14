import { IsInt, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsString, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsNotEmpty()
  mesaId: number;

  @IsInt()
  @IsNotEmpty()
  usuarioId: number;

  @IsInt()
  @IsOptional()
  clienteId?: number;

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