import { PartialType } from '@nestjs/swagger';
import { CreateSucursalDto } from './create-sucursal.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSucursalDto extends PartialType(CreateSucursalDto) {
  @ApiPropertyOptional({ example: false, description: 'Estado operativo de la sucursal' })
  @IsBoolean({ message: 'El estado activo debe ser un valor booleano' })
  @IsOptional()
  activa?: boolean;
}