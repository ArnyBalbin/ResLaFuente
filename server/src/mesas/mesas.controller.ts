import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseUUIDPipe, Query, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MesaService } from './mesas.service';
import { CreateMesaDto } from './dtos/create-mesa.dto';
import { UpdateMesaDto } from './dtos/update-mesa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Salón - Mesas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('mesas')
export class MesaController {
  constructor(private readonly mesaService: MesaService) {}

  @Post()
  @Roles('ADMIN') // Exclusivo de gestión
  @ApiOperation({ summary: 'Registrar una nueva mesa en la sucursal' })
  @ApiResponse({ status: 201, description: 'Mesa registrada' })
  create(
    @Body() createMesaDto: CreateMesaDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.mesaService.create(createMesaDto, sucursalId);
  }

  @Get()
  @Roles('ADMIN', 'MOZO', 'CAJA') // Lectura operativa
  @ApiOperation({ summary: 'Listar todas las mesas (Mapa de salón)' })
  @ApiQuery({ name: 'salon', required: false, type: String })
  @ApiQuery({ name: 'ocupada', required: false, type: Boolean })
  findAll(
    @CurrentUser('sucursalId') sucursalId: string,
    @Query('salon') salon?: string,
    @Query('ocupada') ocupada?: string,
  ) {
    const filtros: any = {};
    if (salon) filtros.salon = salon;
    if (ocupada !== undefined) filtros.ocupada = ocupada === 'true';

    return this.mesaService.findAll(sucursalId, filtros);
  }

  @Get(':id')
  @Roles('ADMIN', 'MOZO', 'CAJA')
  @ApiOperation({ summary: 'Obtener detalle de una mesa' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.mesaService.findOne(id, sucursalId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MOZO') // Los mozos pueden actualizar si la mesa está ocupada/libre
  @ApiOperation({ summary: 'Actualizar estado, capacidad o número de mesa' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateMesaDto: UpdateMesaDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.mesaService.update(id, updateMesaDto, sucursalId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar una mesa del registro' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.mesaService.remove(id, sucursalId);
  }
}