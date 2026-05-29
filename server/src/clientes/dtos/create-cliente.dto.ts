import { 
  IsBoolean, IsEmail, IsNotEmpty, IsNumber, IsOptional, 
  IsString, Length, Matches, MaxLength, Min 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClienteDto {
  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo o Razón Social' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiPropertyOptional({ example: '12345678', description: 'Documento Nacional de Identidad' })
  @IsString()
  @IsOptional()
  @Length(8, 8, { message: 'El DNI debe tener exactamente 8 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El DNI solo debe contener números' })
  dni?: string;

  @ApiPropertyOptional({ example: '10123456789', description: 'Registro Único de Contribuyente' })
  @IsString()
  @IsOptional()
  @Length(11, 11, { message: 'El RUC debe tener exactamente 11 dígitos' })
  @Matches(/^[0-9]+$/, { message: 'El RUC solo debe contener números' })
  ruc?: string;

  @ApiPropertyOptional({ example: 'juan@correo.com' })
  @IsEmail({}, { message: 'Formato de correo electrónico inválido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '987654321', description: 'Teléfono de contacto principal' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  telefono?: string;

  @ApiPropertyOptional({ example: 'Av. Los Pinos 123', description: 'Dirección física o fiscal' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  direccion?: string;

  @ApiPropertyOptional({ example: false, description: 'Habilita la opción de consumos por cobrar' })
  @IsBoolean()
  @IsOptional()
  tieneCredito?: boolean;

  @ApiPropertyOptional({ example: 500.00, description: 'Monto máximo permitido si tiene crédito' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  limiteCredito?: number;
}