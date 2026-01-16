import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto) {
    return this.prisma.producto.create({
      data: {
        nombre: createProductoDto.nombre,
        precio: createProductoDto.precio,
        imagenUrl: createProductoDto.imagenUrl,
        esProductoFinal: createProductoDto.esProductoFinal,
        stock: createProductoDto.esProductoFinal ? 0 : undefined,
        categoriaId: createProductoDto.categoriaId
      }
    });
  }

  findAll() {
    return this.prisma.producto.findMany({
      include: {
        categoria: true,
      },
      orderBy: {
        nombre: 'asc',
      }
    });
  }

  findMenuDelDia() {
    return this.prisma.producto.findMany({
      where: {
        disponibleHoy: true, 
      },
      include: {
        categoria: true,
      }
    });
  }

  findOne(id: number) {
    return this.prisma.producto.findUnique({
      where: { id },
      include: { categoria: true },
    });
  }

  update(id: number, updateProductoDto: UpdateProductoDto) {
    return this.prisma.producto.update({
      where: { id },
      data: updateProductoDto,
    });
  }

  async remove(id: number) {
    const enPedidos = await this.prisma.detallePedido.findFirst({ where: { productoId: id } });
    if (enPedidos) {
      throw new BadRequestException('No se puede eliminar: Este producto está en pedidos históricos. Mejor desactívalo.');
    }

    return this.prisma.producto.delete({ where: { id } });
  }
}