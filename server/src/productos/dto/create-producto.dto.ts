import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoArticulo } from '@prisma/client';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsEnum(TipoArticulo)
  @IsNotEmpty()
  tipo!: TipoArticulo; // El frontend dirá si es PLATO o PRODUCTO

  @IsNumber()
  @Min(0) // <-- EL CAMBIO ESTÁ AQUÍ. Antes decía @IsPositive()
  @Type(() => Number)
  precio!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoriaId!: number;
  
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  controlarStock?: boolean;

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

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  orden?: number; 
}