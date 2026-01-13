import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateMesaDto {
  @IsString()
  @IsNotEmpty()
  numero: string;

  @IsBoolean()
  @IsOptional()
  ocupada?: boolean;
}