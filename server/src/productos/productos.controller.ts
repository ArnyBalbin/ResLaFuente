import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('productos')
export class ProductosController {
  constructor(
    private readonly productosService: ProductosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen')) // 'imagen' es el nombre del campo en el Form-Data
  async create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFile() file: Express.Multer.File, // El archivo llega aquí
  ) {
    let imagenUrl = null;

    // Si subieron foto, la mandamos a Cloudinary
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);
      imagenUrl = result.secure_url;
    }

    // Inyectamos la URL en el DTO (asegúrate de que tu DTO tenga imagenUrl opcional)
    return this.productosService.create({
      ...createProductoDto,
      imagenUrl: imagenUrl || createProductoDto.imagenUrl, // Prioridad a la subida
    });
  }

  @Get()
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.update(id, updateProductoDto);
  }

  @Patch(':id/imagen')
  @UseInterceptors(FileInterceptor('imagen'))
  async updateImagen(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No se envió ninguna imagen');
    }

    const result = await this.cloudinaryService.uploadImage(file);

    return this.productosService.update(id, {
      imagenUrl: result.secure_url,
    });
  }

  @Patch(':id/toggle')
  toggleDisponibilidad(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.toggleDisponibilidad(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productosService.remove(id);
  }
}
