import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  create(createCategoriaDto: CreateCategoriaDto) {
    return this.prisma.categoria.create({
      data: createCategoriaDto,
    });
  }

  findAll() {
    return this.prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { productos: true } } }
    });
  }

  findOne(id: number) {
    return this.prisma.categoria.findUnique({
      where: { id },
    });
  }

  update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    return this.prisma.categoria.update({
      where: { id },
      data: updateCategoriaDto,
    });
  }

  async remove(id: number) {
    // Validación: No borrar si tiene productos
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: { productos: true }
    });

    if (categoria && categoria.productos.length > 0) {
      throw new BadRequestException('No se puede eliminar: Esta categoría tiene productos asociados.');
    }

    return this.prisma.categoria.delete({
      where: { id }
    });
  }
}