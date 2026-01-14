import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { CreateInventarioDto } from './dto/create-inventario.dto';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post()
  registrarMovimiento(@Body() createInventarioDto: CreateInventarioDto) {
    return this.inventarioService.create(createInventarioDto);
  }

  @Get()
  verKardexGeneral() {
    return this.inventarioService.findAll();
  }

  @Get('producto/:id')
  verKardexProducto(@Param('id') id: string) {
    return this.inventarioService.findByProduct(+id);
  }
}