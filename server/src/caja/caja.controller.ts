import { 
  Controller, Get, Post, Body, Param, UseGuards, 
  ParseUUIDPipe, Query, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CajaService } from './caja.service';
import { AbrirCajaDto } from './dtos/abrir-caja.dto';
import { CerrarCajaDto } from './dtos/cerrar-caja.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Finanzas - Operaciones de Caja')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cajas')
export class CajaController {
  constructor(private readonly cajaService: CajaService) {}

  @Post('abrir')
  @Roles('ADMIN', 'CAJA', 'MOZO') // Algunos locales permiten a los mozos manejar su propio 'canguro'
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Aperturar un turno de caja (Fondo inicial)' })
  @ApiResponse({ status: 201, description: 'Caja abierta exitosamente' })
  abrirCaja(
    @Body() dto: AbrirCajaDto,
    @CurrentUser('sucursalId') sucursalId: string,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.cajaService.abrirCaja(dto, sucursalId, usuarioId);
  }

  @Get('actual')
  @Roles('ADMIN', 'CAJA', 'MOZO')
  @ApiOperation({ summary: 'Obtener la caja abierta actual del usuario logueado' })
  obtenerCajaActual(
    @CurrentUser('sucursalId') sucursalId: string,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.cajaService.obtenerCajaActual(sucursalId, usuarioId);
  }

  @Post(':id/cerrar')
  @Roles('ADMIN', 'CAJA', 'MOZO')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realizar el cierre ciego de caja y generar reporte de auditoría' })
  cerrarCaja(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CerrarCajaDto,
    @CurrentUser('sucursalId') sucursalId: string,
    @CurrentUser('sub') usuarioId: string, // Se usa para validar propiedad o permisos de admin
  ) {
    return this.cajaService.cerrarCaja(id, dto, sucursalId, usuarioId);
  }

  @Get('historial')
  @Roles('ADMIN') // Reporte financiero exclusivo para la administración
  @ApiOperation({ summary: 'Obtener el historial de todas las cajas (Arqueos)' })
  @ApiQuery({ name: 'usuarioId', required: false, type: String })
  @ApiQuery({ name: 'fechaInicio', required: false, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'fechaFin', required: false, type: String, description: 'YYYY-MM-DD' })
  historial(
    @CurrentUser('sucursalId') sucursalId: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ) {
    return this.cajaService.historialCajas(sucursalId, { usuarioId, fechaInicio, fechaFin });
  }
}