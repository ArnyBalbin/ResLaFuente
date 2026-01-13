import { IsString, IsNotEmpty, IsNumber, IsInt, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsInt()
  categoriaId: number;

  @IsString()
  @IsOptional()
  imagenUrl?: string;

  @IsBoolean()
  @IsOptional()
  esProductoFinal?: boolean;

  @IsInt()
  @IsOptional()
  stock?: number;

  @IsBoolean()
  @IsOptional()
  disponibleHoy?: boolean;
}