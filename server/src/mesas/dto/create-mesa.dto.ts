import { IsString, IsNotEmpty, IsBoolean, IsOptional, MaxLength, IsInt, IsPositive } from 'class-validator';

export class CreateMesaDto {
  @IsString()
  @IsNotEmpty({ message: 'El número o nombre de la mesa es obligatorio' })
  @MaxLength(10, { message: 'El número de mesa no debe exceder 10 caracteres' })
  numero: string;

  @IsInt()
  @IsPositive({ message: 'La capacidad debe ser un número positivo' })
  capacidad: number;
}