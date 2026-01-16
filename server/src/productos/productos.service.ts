import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: createProductoDto.categoriaId },
    });
    if (!categoria) {
      throw new BadRequestException('La categoría no existe');
    }

    if (!createProductoDto.controlarStock) {
        createProductoDto.stock = 0;
        createProductoDto.costo = 0;
    }

    return this.prisma.producto.create({
      data: createProductoDto,
    });
  }

  async findAll() {
    return this.prisma.producto.findMany({
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
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

  async toggleDisponibilidad(id: number) {
     const producto = await this.findOne(id);
     return this.prisma.producto.update({
        where: { id },
        data: { disponibleHoy: !producto.disponibleHoy }
     });
  }
  
  async remove(id: number) {
    const enPedidos = await this.prisma.detallePedido.findFirst({
      where: { productoId: id },
    });
    if (enPedidos) {
      throw new BadRequestException(
        'No se puede eliminar: Este producto está en pedidos históricos. Mejor desactívalo.',
      );
    }

    return this.prisma.producto.delete({ where: { id } });
  }
}
