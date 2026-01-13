import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CreateCajaDto, CerrarCajaDto } from './dto/create-caja.dto';

@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Post('abrir')
  abrir(@Body() createCajaDto: CreateCajaDto) {
    return this.cajaService.abrir(createCajaDto);
  }

  @Patch('cerrar/:id')
  cerrar(@Param('id') id: string, @Body() cerrarCajaDto: CerrarCajaDto) {
    return this.cajaService.cerrar(+id, cerrarCajaDto);
  }

  @Get('abierta/:usuarioId')
  obtenerAbierta(@Param('usuarioId') usuarioId: string) {
    return this.cajaService.obtenerCajaAbierta(+usuarioId);
  }
}