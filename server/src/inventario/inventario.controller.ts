import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  create(@Body() createMovimientoDto: CreateInventarioDto) {
    return this.inventarioService.create(createMovimientoDto);
  }

  @Get(':productoId')
  verKardex(@Param('productoId', ParseIntPipe) productoId: number) {
    return this.inventarioService.findKardexByProducto(productoId);
  }
}