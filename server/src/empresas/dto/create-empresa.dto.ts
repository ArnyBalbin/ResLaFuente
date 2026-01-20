import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @IsNotEmpty()
  razonSocial: string;

  @IsString()
  @IsNotEmpty()
  ruc: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsOptional()
  @IsBoolean()
  tieneCredito?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  limiteCredito?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  diaCierre?: number;
}