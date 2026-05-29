import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseUUIDPipe, Query, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConvenioTrabajadorService } from './convenios.service';
import { CreateConvenioDto } from './dtos/create-convenio.dto';
import { UpdateConvenioDto } from './dtos/update-convenio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Directorio Corporativo - Convenios de Trabajadores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('convenios')
export class ConvenioTrabajadorController {
  constructor(private readonly convenioService: ConvenioTrabajadorService) {}

  @Post()
  @Roles('ADMIN') // Solo la gerencia establece convenios económicos
  @ApiOperation({ summary: 'Vincular un cliente (trabajador) con una empresa (Convenio)' })
  @ApiResponse({ status: 201, description: 'Convenio creado exitosamente' })
  create(@Body() createConvenioDto: CreateConvenioDto) {
    return this.convenioService.create(createConvenioDto);
  }

  @Get()
  @Roles('ADMIN', 'CAJA', 'MOZO') // Todo el personal necesita verificar convenios al cobrar/pedir
  @ApiOperation({ summary: 'Listar convenios activos o filtrar por trabajador/empresa' })
  @ApiQuery({ name: 'empresaId', required: false, type: String })
  @ApiQuery({ name: 'clienteId', required: false, type: String })
  @ApiQuery({ name: 'activo', required: false, type: Boolean })
  findAll(
    @Query('empresaId') empresaId?: string,
    @Query('clienteId') clienteId?: string,
    @Query('activo') activo?: string,
  ) {
    return this.convenioService.findAll({
      empresaId,
      clienteId,
      activo: activo !== undefined ? activo === 'true' : undefined,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'CAJA', 'MOZO')
  @ApiOperation({ summary: 'Obtener detalle específico de un convenio' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.convenioService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar límite diario o desactivar el convenio' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateConvenioDto: UpdateConvenioDto
  ) {
    return this.convenioService.update(id, updateConvenioDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar convenio (Solo si no tiene pedidos históricos)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.convenioService.remove(id);
  }
}