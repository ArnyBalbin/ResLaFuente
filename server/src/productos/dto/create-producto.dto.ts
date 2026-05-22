import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number) // Vital para form-data
  precio!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  categoriaId!: number;
  
  @IsBoolean()
  @IsOptional() // Opcional porque tiene default true en DB
  @Type(() => Boolean) // Transforma "true"/"false" string a boolean
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
  @IsOptional() // Opcional, default true
  @Type(() => Boolean)
  disponibleHoy?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  orden?: number; // <--- AQUÍ ESTÁ EL CAMPO QUE FALTABA
}