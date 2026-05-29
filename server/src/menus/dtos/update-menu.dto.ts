import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateMenuDto } from './create-menu.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMenuDto extends PartialType(CreateMenuDto) {
  @ApiPropertyOptional({ example: false, description: 'Desactivar menú temporalmente' })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}