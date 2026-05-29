import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoPedido } from '@prisma/client';

export class UpdateEstadoPedidoDto {
  @ApiProperty({ enum: EstadoPedido, description: 'Nuevo estado operativo del pedido' })
  @IsEnum(EstadoPedido)
  @IsNotEmpty()
  estado!: EstadoPedido;
}