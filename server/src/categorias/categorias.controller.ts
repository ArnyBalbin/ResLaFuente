import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseUUIDPipe, Query, HttpCode, HttpStatus, ParseBoolPipe 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoriaService } from './categorias.service';
import { CreateCategoriaDto } from './dtos/create-categoria.dto';
import { UpdateCategoriaDto } from './dtos/update-categoria.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Catálogo - Categorías')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categorias')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Post()
  @Roles('ADMIN') // Exclusivo de gestión
  @ApiOperation({ summary: 'Crear una nueva categoría de productos' })
  @ApiResponse({ status: 201, description: 'Categoría creada' })
  create(
    @Body() createCategoriaDto: CreateCategoriaDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.categoriaService.create(createCategoriaDto, sucursalId);
  }

  @Get()
  @Roles('ADMIN', 'MOZO', 'COCINA', 'CAJA') // Lectura para toda la operación
  @ApiOperation({ summary: 'Listar todas las categorías (Catálogo)' })
  @ApiQuery({ name: 'incluirHijos', required: false, type: Boolean, description: 'Devolver estructura en árbol' })
  findAll(
    @CurrentUser('sucursalId') sucursalId: string,
    @Query('incluirHijos') incluirHijos?: string,
  ) {
    const hijos = incluirHijos === 'true';
    return this.categoriaService.findAll(sucursalId, hijos);
  }

  @Get(':id')
  @Roles('ADMIN', 'MOZO', 'CAJA')
  @ApiOperation({ summary: 'Obtener detalle de una categoría específica' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.categoriaService.findOne(id, sucursalId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar una categoría' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateCategoriaDto: UpdateCategoriaDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.categoriaService.update(id, updateCategoriaDto, sucursalId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una categoría (Soft Delete)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.categoriaService.remove(id, sucursalId);
  }
}