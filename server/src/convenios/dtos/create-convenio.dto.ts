import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConvenioDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'ID del Cliente (Trabajador)' })
  @IsUUID('4', { message: 'El ID del cliente debe ser un UUID válido' })
  @IsNotEmpty()
  clienteId!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002', description: 'ID de la Empresa corporativa' })
  @IsUUID('4', { message: 'El ID de la empresa debe ser un UUID válido' })
  @IsNotEmpty()
  empresaId!: string;

  @ApiProperty({ example: 10.00, description: 'Monto máximo en soles que la empresa cubre por día para este trabajador' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01, { message: 'El límite diario debe ser mayor a cero' })
  @IsNotEmpty()
  limiteDiario!: number;
}