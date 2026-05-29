import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseUUIDPipe, Query, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PedidoService } from './pedidos.service';
import { CreatePedidoDto } from './dtos/create-pedido.dto';
import { UpdateEstadoPedidoDto } from './dtos/update-estado-pedido.dto';
import { AnularPedidoDto } from './dtos/anular-pedido.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EstadoPedido, TipoPedido } from '@prisma/client';

@ApiTags('Operaciones - Pedidos y Comandas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Post()
  @Roles('ADMIN', 'MOZO', 'CAJA') // El núcleo operativo del sistema
  @ApiOperation({ summary: 'Generar una nueva comanda/pedido' })
  @ApiResponse({ status: 201, description: 'Pedido creado y mesas ocupadas' })
  create(
    @Body() createPedidoDto: CreatePedidoDto,
    @CurrentUser('sucursalId') sucursalId: string,
    @CurrentUser('sub') usuarioId: string, // ID del mozo extraído del token
  ) {
    return this.pedidoService.create(createPedidoDto, sucursalId, usuarioId);
  }

  @Get()
  @Roles('ADMIN', 'MOZO', 'CAJA', 'COCINA') // Cocina necesita leer los pendientes
  @ApiOperation({ summary: 'Listar comandas (Monitor de salón o KDS)' })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoPedido })
  @ApiQuery({ name: 'tipo', required: false, enum: TipoPedido })
  @ApiQuery({ name: 'fecha', required: false, type: String, description: 'Formato YYYY-MM-DD' })
  findAll(
    @CurrentUser('sucursalId') sucursalId: string,
    @Query('estado') estado?: EstadoPedido,
    @Query('tipo') tipo?: TipoPedido,
    @Query('fecha') fecha?: string,
  ) {
    return this.pedidoService.findAll(sucursalId, { estado, tipo, fecha });
  }

  @Get(':id')
  @Roles('ADMIN', 'MOZO', 'CAJA', 'COCINA')
  @ApiOperation({ summary: 'Obtener el ticket detallado de un pedido' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.pedidoService.findOne(id, sucursalId);
  }

  @Patch(':id/estado')
  @Roles('ADMIN', 'MOZO', 'CAJA', 'COCINA') // Cocina marcará como LISTO, Mozo como SERVIDO
  @ApiOperation({ summary: 'Avanzar el estado operativo del pedido (KDS y Salón)' })
  updateEstado(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateEstadoDto: UpdateEstadoPedidoDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.pedidoService.updateEstado(id, updateEstadoDto, sucursalId);
  }

  @Delete(':id/anular')
  @Roles('ADMIN') // Riesgo financiero: Solo administradores anulan pedidos
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Anular un pedido y liberar las mesas asociadas' })
  anularPedido(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AnularPedidoDto,
    @CurrentUser('sucursalId') sucursalId: string,
    @CurrentUser('sub') usuarioAdminId: string,
  ) {
    return this.pedidoService.anularPedido(id, dto, sucursalId, usuarioAdminId);
  }
}