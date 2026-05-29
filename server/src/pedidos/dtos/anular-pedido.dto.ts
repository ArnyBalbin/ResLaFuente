import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnularPedidoDto {
  @ApiProperty({ example: 'Cliente se retiró del local por demora', description: 'Justificación obligatoria para la auditoría' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  motivoAnulacion!: string;
}