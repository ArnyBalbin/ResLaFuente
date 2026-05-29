import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateMesaDto } from './create-mesa.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMesaDto extends PartialType(CreateMesaDto) {
  @ApiPropertyOptional({ example: true, description: 'Estado manual de ocupación' })
  @IsBoolean()
  @IsOptional()
  ocupada?: boolean;
}