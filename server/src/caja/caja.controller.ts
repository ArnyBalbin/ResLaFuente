import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { CajaService } from './caja.service';
import { AbrirCajaDto, CerrarCajaDto } from './dto/create-caja.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('caja')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Post('abrir')
  abrir(@Request() req, @Body() abrirCajaDto: AbrirCajaDto) {
    return this.cajaService.abrir(req.user.userId, abrirCajaDto);
  }

  @Post('cerrar')
  cerrar(@Request() req, @Body() cerrarCajaDto: CerrarCajaDto) {
    return this.cajaService.cerrar(req.user.userId, cerrarCajaDto);
  }

  @Get('estado')
  verEstado(@Request() req) {
    return this.cajaService.obtenerCajaAbierta(req.user.userId);
  }
}