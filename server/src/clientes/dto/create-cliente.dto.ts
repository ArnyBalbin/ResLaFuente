import { IsString, IsNotEmpty, IsOptional, IsInt, IsEmail, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  ruc?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsBoolean()
  @IsOptional()
  tieneCredito?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  limiteCredito?: number;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  convenioEmpresaId?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  convenioLimiteDiario?: number;
}