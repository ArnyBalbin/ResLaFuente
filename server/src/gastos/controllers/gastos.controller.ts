import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GastoService } from '../services/gastos.service';
import { CreateGastoDto } from '../dtos/create-gasto.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Finanzas - Egresos y Compras')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gastos')
export class GastoController {
  constructor(private readonly gastoService: GastoService) {}

  @Post()
  @Roles('ADMIN', 'CAJA') // Los cajeros registran egresos (ej. pagarle al proveedor de gas)
  @ApiOperation({ summary: 'Registrar un nuevo egreso de dinero' })
  create(
    @Body() dto: CreateGastoDto,
    @CurrentUser('sucursalId') sucursalId: string,
    @CurrentUser('sub') usuarioId: string,
  ) {
    return this.gastoService.create(dto, sucursalId, usuarioId);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener el registro histórico de egresos (Para Estado de Resultados)' })
  @ApiQuery({ name: 'mes', required: false, type: String, description: 'Formato YYYY-MM' })
  @ApiQuery({ name: 'cajaId', required: false, type: String })
  findAll(
    @CurrentUser('sucursalId') sucursalId: string,
    @Query('mes') mes?: string,
    @Query('cajaId') cajaId?: string,
  ) {
    return this.gastoService.findAll(sucursalId, { mes, cajaId });
  }
}