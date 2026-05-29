import { 
  UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, ParseUUIDPipe, Query, HttpCode, HttpStatus, ParseBoolPipe 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProductoService } from './productos.service';
import { CreateProductoDto } from './dtos/create-producto.dto';
import { UpdateProductoDto } from './dtos/update-producto.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Catálogo - Productos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('productos')
export class ProductoController {
  constructor(private readonly productoService: ProductoService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Registrar un nuevo producto/plato en el catálogo' })
  @ApiResponse({ status: 201, description: 'Producto creado' })
  create(
    @Body() createProductoDto: CreateProductoDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.productoService.create(createProductoDto, sucursalId);
  }

  @Post(':id/imagen')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file')) // 'file' es el nombre del campo en el form-data
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir o reemplazar la imagen de un producto en Cloudinary' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (JPEG, PNG, WEBP)',
        },
      },
    },
  })
  async uploadImagen(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // Máximo 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }), // Solo imágenes
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    return this.productoService.subirImagen(id, sucursalId, file);
  }

  @Get()
  @Roles('ADMIN', 'MOZO', 'COCINA', 'CAJA')
  @ApiOperation({ summary: 'Obtener el menú de productos' })
  @ApiQuery({ name: 'categoriaId', required: false, type: String })
  @ApiQuery({ name: 'disponibleHoy', required: false, type: Boolean })
  findAll(
    @CurrentUser('sucursalId') sucursalId: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('disponibleHoy') disponibleHoy?: string,
  ) {
    const filtros: any = {};
    if (categoriaId) filtros.categoriaId = categoriaId;
    if (disponibleHoy !== undefined) filtros.disponibleHoy = disponibleHoy === 'true';

    return this.productoService.findAll(sucursalId, filtros);
  }

  @Get(':id')
  @Roles('ADMIN', 'MOZO', 'CAJA')
  @ApiOperation({ summary: 'Obtener el detalle de un producto' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.productoService.findOne(id, sucursalId);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar precios, stock o disponibilidad' })
  update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateProductoDto: UpdateProductoDto,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.productoService.update(id, updateProductoDto, sucursalId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dar de baja un producto del catálogo' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('sucursalId') sucursalId: string,
  ) {
    return this.productoService.remove(id, sucursalId);
  }
  
}