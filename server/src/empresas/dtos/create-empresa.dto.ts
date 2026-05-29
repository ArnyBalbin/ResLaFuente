import { 
  IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, 
  IsString, Length, Matches, Max, MaxLength, Min 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmpresaDto {
  @ApiProperty({ example: 'Constructora del Norte S.A.C.', description: 'Razón Social legal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  razonSocial!: string;

  @ApiProperty({ example: '20123456789', description: 'Registro Único de Contribuyente (RUC)' })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'El RUC debe tener exactamente 11 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El RUC solo debe contener números' })
  ruc!: string;

  @ApiPropertyOptional({ example: 'Av. Industrial 456', description: 'Domicilio fiscal' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  direccion?: string;

  @ApiPropertyOptional({ example: '044-123456', description: 'Teléfono de contacto corporativo' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ example: true, description: 'Habilita línea de crédito corporativa' })
  @IsBoolean()
  @IsOptional()
  tieneCredito?: boolean;

  @ApiPropertyOptional({ example: 5000.00, description: 'Línea de crédito global mensual para la empresa' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  limiteCredito?: number;

  @ApiPropertyOptional({ example: 30, description: 'Día del mes en que se cierra la facturación (1-31)' })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  diaCierre?: number;
}