import { Injectable } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  create(createProductoDto: CreateProductoDto) {
    return this.prisma.producto.create({
      data: createProductoDto,
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

  // 6. ELIMINAR
  remove(id: number) {
    return this.prisma.producto.delete({
      where: { id },
    });
  }
}