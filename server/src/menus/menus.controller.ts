import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseUUIDPipe, Query, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MenuService } from './menus.service';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { UpdateMenuDto } from './dtos/update-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Catálogo - Menús Completos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear un nuevo Menú (Segundo + Entradas)' })
  @ApiResponse({ status: 201, description: 'Menú creado exitosamente' })
  create(
    @Body() createMenuDto: CreateMenuDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.menuService.create(createMenuDto, sucursalId);
  }

  @Get()
  @Roles('ADMIN', 'MOZO', 'CAJA')
  @ApiOperation({ summary: 'Listar los menús configurados en la sucursal' })
  @ApiQuery({ name: 'soloActivos', required: false, type: Boolean })
  findAll(
    @CurrentUser('sucursalId') sucursalId: string,
    @Query('soloActivos') soloActivos?: string,
  ) {
    const activos = soloActivos === 'true';
    return this.menuService.findAll(sucursalId, activos);
  }

  @Get(':id')
  @Roles('ADMIN', 'MOZO', 'CAJA')
  @ApiOperation({ summary: 'Obtener el detalle de un menú específico' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.menuService.findOne(id, sucursalId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar precios, plato principal o lista de entradas' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateMenuDto: UpdateMenuDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.menuService.update(id, updateMenuDto, sucursalId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar un menú temporalmente' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.menuService.remove(id, sucursalId);
  }
}