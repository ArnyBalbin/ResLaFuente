import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Post()
  registrarPago(@Request() req, @Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.create(req.user.userId, createPagoDto);
  }

  @Get()
  findAll() {
    return this.pagosService.findAll();
  }
}