import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, IsOptional, IsPositive } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la categoría es obligatorio' })
  nombre: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  padreId?: number;
  
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  orden?: number;
}