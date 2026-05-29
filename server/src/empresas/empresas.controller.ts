import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseUUIDPipe, Query, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmpresaService } from './empresas.service';
import { CreateEmpresaDto } from './dtos/create-empresa.dto';
import { UpdateEmpresaDto } from './dtos/update-empresa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Directorio Corporativo - Empresas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('empresas')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Post()
  @Roles('ADMIN') // Evaluación de crédito corporativo es exclusiva de gerencia
  @ApiOperation({ summary: 'Registrar una nueva empresa corporativa' })
  @ApiResponse({ status: 201, description: 'Empresa registrada exitosamente' })
  create(@Body() createEmpresaDto: CreateEmpresaDto) {
    return this.empresaService.create(createEmpresaDto);
  }

  @Get()
  @Roles('ADMIN', 'CAJA') // Caja necesita listar para generar facturas globales
  @ApiOperation({ summary: 'Buscar empresas en el directorio' })
  @ApiQuery({ name: 'buscar', required: false, type: String, description: 'Buscar por Razón Social o RUC' })
  @ApiQuery({ name: 'conCredito', required: false, type: Boolean })
  findAll(
    @Query('buscar') buscar?: string,
    @Query('conCredito') conCredito?: string,
  ) {
    return this.empresaService.findAll({
      buscar,
      conCredito: conCredito !== undefined ? conCredito === 'true' : undefined,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'CAJA')
  @ApiOperation({ summary: 'Obtener detalle y uso de crédito de la empresa' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.empresaService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar límites de crédito, días de cierre o datos' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateEmpresaDto: UpdateEmpresaDto
  ) {
    return this.empresaService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar empresa corporativa (Solo si no tiene convenios)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.empresaService.remove(id);
  }
}