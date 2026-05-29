import { PartialType, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(OmitType(CreateUsuarioDto, ['email'] as const)) {
  @ApiPropertyOptional({ example: true, description: 'Estado activo del usuario en el sistema' })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}