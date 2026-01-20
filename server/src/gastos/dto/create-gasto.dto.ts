import { 
  IsBoolean, 
  IsNotEmpty, 
  IsNumber, 
  IsPositive, 
  IsString, 
  IsOptional
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGastoDto {
  @IsString()
  @IsNotEmpty({ message: 'La descripción del gasto es obligatoria' })
  descripcion: string;

  @IsNumber()
  @IsPositive({ message: 'El monto debe ser mayor a 0' })
  @Type(() => Number)
  monto: number;

  @IsString()
  @IsNotEmpty()
  categoria: string; 

  @IsBoolean()
  @Type(() => Boolean)
  esCosto: boolean; 

  @IsString()
  @IsOptional()
  observaciones?: string;
}