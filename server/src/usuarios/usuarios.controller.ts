import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseUUIDPipe, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsuarioService } from './usuarios.service';
import { CreateUsuarioDto } from './dtos/create-usuario.dto';
import { UpdateUsuarioDto } from './dtos/update-usuario.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Usuarios y Personal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @Roles('ADMIN') // Solo el administrador local puede crear empleados
  @ApiOperation({ summary: 'Registrar un nuevo colaborador en la sucursal actual' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente (sin credenciales expuestas)' })
  create(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.usuarioService.create(createUsuarioDto, sucursalId);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar todos los colaboradores de la sucursal actual' })
  findAll(@CurrentUser('sucursalId') sucursalId: string) {
    return this.usuarioService.findAll(sucursalId);
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener el detalle de un colaborador' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.usuarioService.findOne(id, sucursalId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar datos de un colaborador (incluyendo reset de PIN/Password)' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.usuarioService.update(id, updateUsuarioDto, sucursalId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dar de baja a un colaborador (Soft Delete)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.usuarioService.remove(id, sucursalId);
  }
}