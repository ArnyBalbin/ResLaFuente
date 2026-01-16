import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoDto } from './create-producto.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
    @IsBoolean()
    @IsOptional()
    disponibleHoy?: boolean;
}