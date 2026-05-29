import { 
  Controller, Get, Post, Body, UseGuards, 
  Query, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PagoService } from './pagos.service';
import { ProcesarPagoDto } from './dtos/procesar-pago.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Finanzas - Pasarela y Cobros')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pagos')
export class PagoController {
  constructor(private readonly pagoService: PagoService) {}

  @Post('procesar')
  @Roles('ADMIN', 'CAJA', 'MOZO') // Los roles operativos pueden cobrar
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Procesar el pago de un pedido (Soporta múltiples métodos simultáneos)' })
  @ApiResponse({ status: 200, description: 'Pago procesado correctamente' })
  procesar(
    @Body() dto: ProcesarPagoDto,
    @CurrentUser('sucursalId') sucursalId: string,
    @CurrentUser('sub') usuarioCajeroId: string,
  ) {
    return this.pagoService.procesarPagos(dto, sucursalId, usuarioCajeroId);
  }

  @Get('historial')
  @Roles('ADMIN', 'CAJA')
  @ApiOperation({ summary: 'Listar historial de cobros de la sucursal' })
  @ApiQuery({ name: 'fechaInicio', required: false, type: String })
  @ApiQuery({ name: 'fechaFin', required: false, type: String })
  findAll(
    @CurrentUser('sucursalId') sucursalId: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.pagoService.historialPagos(sucursalId, { fechaInicio, fechaFin });
  }
}