import { Controller, Get, Post, Body, Param, Delete, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriaGastoService } from '../services/categoria-gasto.service';
import { CreateCategoriaGastoDto } from '../dtos/create-categoria-gasto.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@ApiTags('Finanzas - Categorías Contables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categorias-gasto')
export class CategoriaGastoController {
  constructor(private readonly categoriaService: CategoriaGastoService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear una nueva categoría para tipificar egresos' })
  create(@Body() dto: CreateCategoriaGastoDto, @CurrentUser('sucursalId') sucursalId: string) {
    return this.categoriaService.create(dto, sucursalId);
  }

  @Get()
  @Roles('ADMIN', 'CAJA') // Caja necesita listar para tipificar el retiro
  @ApiOperation({ summary: 'Obtener el catálogo de cuentas/categorías' })
  findAll(@CurrentUser('sucursalId') sucursalId: string) {
    return this.categoriaService.findAll(sucursalId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriaService.remove(id);
  }
}