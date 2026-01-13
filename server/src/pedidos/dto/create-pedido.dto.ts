import { IsInt, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsString, Min } from 'class-validator';
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetallePedidoDto)
  detalles: DetallePedidoDto[];
}