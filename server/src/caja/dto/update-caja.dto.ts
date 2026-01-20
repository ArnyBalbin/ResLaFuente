import { PartialType } from '@nestjs/mapped-types';
import { AbrirCajaDto, CerrarCajaDto } from './create-caja.dto';

export class UpdateCajaDto extends PartialType(AbrirCajaDto) {}
