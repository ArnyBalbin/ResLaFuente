import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseUUIDPipe, Query, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ClienteService } from './clientes.service';
import { CreateClienteDto } from './dtos/create-cliente.dto';
import { UpdateClienteDto } from './dtos/update-cliente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Directorio - Clientes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('clientes')
export class ClienteController {
  constructor(private readonly clienteService: ClienteService) {}

  @Post()
  @Roles('ADMIN', 'CAJA') // Cajeros necesitan crear clientes para emitir comprobantes
  @ApiOperation({ summary: 'Registrar un nuevo cliente en la base de datos global' })
  @ApiResponse({ status: 201, description: 'Cliente registrado' })
  create(@Body() createClienteDto: CreateClienteDto) {
    return this.clienteService.create(createClienteDto);
  }

  @Get()
  @Roles('ADMIN', 'CAJA', 'MOZO') // Mozos necesitan buscar clientes al abrir mesas a crédito
  @ApiOperation({ summary: 'Buscar clientes en el directorio' })
  @ApiQuery({ name: 'buscar', required: false, type: String, description: 'Buscar por Nombre, DNI o RUC' })
  @ApiQuery({ name: 'conCredito', required: false, type: Boolean })
  @ApiQuery({ name: 'conDeuda', required: false, type: Boolean })
  findAll(
    @Query('buscar') buscar?: string,
    @Query('conCredito') conCredito?: string,
    @Query('conDeuda') conDeuda?: string,
  ) {
    return this.clienteService.findAll({
      buscar,
      conCredito: conCredito !== undefined ? conCredito === 'true' : undefined,
      conDeuda: conDeuda === 'true',
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'CAJA')
  @ApiOperation({ summary: 'Obtener detalle y saldos del cliente' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.clienteService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'CAJA')
  @ApiOperation({ summary: 'Actualizar datos de contacto o líneas de crédito' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateClienteDto: UpdateClienteDto
  ) {
    return this.clienteService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar cliente (Solo si no tiene deudas ni historial)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.clienteService.remove(id);
  }
}