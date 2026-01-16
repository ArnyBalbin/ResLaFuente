import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoProducto } from '@prisma/client';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  precio: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoriaId: number;

  @IsEnum(TipoProducto, { message: 'El tipo debe ser CARTA, MENU, GUARNICION, BEBIDA o EXTRA' })
  tipo: TipoProducto; // <--- Nuevo Campo Obligatorio
  
  @IsBoolean()
  @Type(() => Boolean)
  controlarStock: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  costo?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsString()
  @IsOptional()
  imagenUrl?: string;
  
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  disponibleHoy?: boolean;
}