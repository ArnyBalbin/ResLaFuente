import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Min, IsInt } from 'class-validator';

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
  limiteCredito?: number; // Ej: 5000 soles

  @IsOptional()
  @IsInt()
  @Min(1)
  diaCierre?: number;
  
}