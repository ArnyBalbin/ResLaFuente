import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'; // Importamos aquí

@Injectable()
export class ProductosService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService, // Inyectamos aquí
  ) {}

  async create(createProductoDto: CreateProductoDto, file?: Express.Multer.File) {
    // 1. Validar Categoría
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: createProductoDto.categoriaId },
    });
    if (!categoria) {
      throw new BadRequestException('La categoría no existe');
    }

    // 2. Lógica de Stock
    if (!createProductoDto.controlarStock) {
      createProductoDto.stock = 0;
      createProductoDto.costo = 0;
    }

    // 3. Subir Imagen (Si existe)
    if (file) {
      const result = await this.cloudinary.uploadImage(file);
      createProductoDto.imagenUrl = result.secure_url;
    }

    // 4. Guardar
    return this.prisma.producto.create({
      data: createProductoDto,
    });
  }

  async findAll() {
    return this.prisma.producto.findMany({
      include: { categoria: true },
      // --- CORRECCIÓN SENIOR: ORDEN MULTINIVEL ---
      orderBy: [
        { categoria: { nombre: 'asc' } }, // 1. Agrupar por nombre de categoría
        { orden: 'asc' },                 // 2. Respetar el orden manual
        { nombre: 'asc' },                // 3. Alfabético por si acaso
      ],
    });
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: { categoria: true },
    });
    if (!producto) throw new NotFoundException(`Producto #${id} no encontrado`);
    return producto;
  }

  // Actualización de datos (Texto)
  async update(id: number, updateProductoDto: UpdateProductoDto) {
    await this.findOne(id);

    if (updateProductoDto.controlarStock === false) {
      updateProductoDto.stock = 0;
      updateProductoDto.costo = 0;
    }

    return this.prisma.producto.update({
      where: { id },
      data: updateProductoDto,
    });
  }

  // Actualización exclusiva de Imagen
  async updateImagen(id: number, file: Express.Multer.File) {
    const producto = await this.findOne(id); // Verificamos que exista

    const result = await this.cloudinary.uploadImage(file);

    return this.prisma.producto.update({
      where: { id },
      data: { imagenUrl: result.secure_url },
    });
  }

  async toggleDisponibilidad(id: number) {
    const producto = await this.findOne(id);
    return this.prisma.producto.update({
      where: { id },
      data: { disponibleHoy: !producto.disponibleHoy },
    });
  }

  async remove(id: number) {
    // --- ESTO ESTÁ EXCELENTE ---
    // Protege la integridad histórica de tus ventas
    const enPedidos = await this.prisma.detallePedido.findFirst({
      where: { productoId: id },
    });
    if (enPedidos) {
      throw new BadRequestException(
        'No se puede eliminar: Este producto está en pedidos históricos. Mejor desactívalo (Toggle).',
      );
    }

    return this.prisma.producto.delete({ where: { id } });
  }
}