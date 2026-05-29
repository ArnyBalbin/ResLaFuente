import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseUUIDPipe, Query, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SucursalService } from './sucursal.service';
import { CreateSucursalDto } from './dtos/create-sucursal.dto';
import { UpdateSucursalDto } from './dtos/update-sucursal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Sucursales')
@ApiBearerAuth() // Indica a Swagger que estos endpoints requieren Token
@UseGuards(JwtAuthGuard, RolesGuard) // Protege todo el controlador
@Controller('sucursales')
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}

  @Post()
  @Roles('ADMIN') // Solo Administradores
  @ApiOperation({ summary: 'Registrar una nueva sucursal comercial' })
  @ApiResponse({ status: 201, description: 'Sucursal creada exitosamente' })
  create(@Body() createSucursalDto: CreateSucursalDto) {
    return this.sucursalService.create(createSucursalDto);
  }

  @Get()
  @Roles('ADMIN', 'MOZO', 'CAJA') // Lectura abierta para el personal operativo (útil para selectores)
  @ApiOperation({ summary: 'Obtener el listado de sucursales' })
  @ApiQuery({ name: 'soloActivas', required: false, type: Boolean, description: 'Filtrar por estado operativo' })
  findAll(@Query('soloActivas') soloActivas?: string) {
    const filtrarActivas = soloActivas !== 'false';
    return this.sucursalService.findAll(filtrarActivas);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener el detalle de una sucursal específica' })
  @ApiResponse({ status: 200, description: 'Datos de la sucursal' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sucursalService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar los datos de una sucursal' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateSucursalDto: UpdateSucursalDto
  ) {
    return this.sucursalService.update(id, updateSucursalDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar una sucursal (Soft Disable)' })
  @ApiResponse({ status: 200, description: 'Sucursal desactivada correctamente' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sucursalService.deactivate(id);
  }
}