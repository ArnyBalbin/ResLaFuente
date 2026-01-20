import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { GastosService } from './gastos.service';
import { CreateGastoDto } from './dto/create-gasto.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Post()
  create(@Request() req, @Body() createGastoDto: CreateGastoDto) {
    return this.gastosService.create(req.user.userId, createGastoDto);
  }

  @Get('hoy')
  findAllHoy() {
    return this.gastosService.findAllHoy();
  }
}