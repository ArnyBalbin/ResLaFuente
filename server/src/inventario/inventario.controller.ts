import { 
  Controller, Get, Post, Body, UseGuards, 
  Query, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventarioService } from './inventario.service';
import { CreateMovimientoDto } from './dtos/create-movimiento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Almacén - Control de Inventario y Kardex')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Post('movimiento')
  @Roles('ADMIN') // Solo los administradores pueden alterar los registros de almacén manualmente
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar una entrada, salida o ajuste manual (Afecta el stock inmediatamente)' })
  @ApiResponse({ status: 201, description: 'Movimiento registrado y stock actualizado' })
  registrarMovimiento(
    @Body() dto: CreateMovimientoDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.inventarioService.registrarMovimiento(dto, sucursalId);
  }

  @Get('kardex')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Consultar el registro inmutable de movimientos (Kardex)' })
  @ApiQuery({ name: 'productoId', required: false, type: String })
  @ApiQuery({ name: 'fechaInicio', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'fechaFin', required: false, type: String, description: 'YYYY-MM-DD' })
  obtenerKardex(
    @CurrentUser('sucursalId') sucursalId: string,
    @Query('productoId') productoId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.inventarioService.obtenerKardex(sucursalId, { productoId, fechaInicio, fechaFin });
  }

  @Get('alertas')
  @Roles('ADMIN', 'COCINA', 'MOZO') // Cocina y administradores necesitan estar al tanto de qué se acaba
  @ApiOperation({ summary: 'Obtener listado de productos con stock crítico (Debajo del stock mínimo)' })
  obtenerAlertas(@CurrentUser('sucursalId') sucursalId: string) {
    return this.inventarioService.alertasStockMinimo(sucursalId);
  }
}