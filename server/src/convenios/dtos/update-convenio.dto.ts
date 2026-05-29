import { PartialType, OmitType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateConvenioDto } from './create-convenio.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateConvenioDto extends PartialType(OmitType(CreateConvenioDto, ['clienteId', 'empresaId'] as const)) {
  @ApiPropertyOptional({ example: false, description: 'Desactiva el convenio temporal o permanentemente' })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}