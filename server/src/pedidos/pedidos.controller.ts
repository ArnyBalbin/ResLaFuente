import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @Get()
  findAll(@Query('estados') estados?: string) {
    // estados vendrá como un string separado por comas, ej: "PENDIENTE,EN_PROCESO"
    return this.pedidosService.findAll(estados);
  }
  
}