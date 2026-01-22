import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    const { padreId, orden, nombre } = createCategoriaDto;

    if (padreId) {
      const padre = await this.prisma.categoria.findUnique({
        where: { id: padreId },
      });
      if (!padre) {
        throw new NotFoundException('La categoría padre no existe');
      }
    }

    // calcular orden si no viene
    let nuevoOrden = orden;

    if (nuevoOrden === undefined) {
      const last = await this.prisma.categoria.findFirst({
        where: { padreId: padreId ?? null },
        orderBy: { orden: 'desc' },
      });

      nuevoOrden = last ? last.orden + 1 : 0;
    }

    return this.prisma.categoria.create({
      data: {
        nombre,
        padreId: padreId ?? null,
        orden: nuevoOrden,
      },
    });
  }

  async findAll() {
    return this.prisma.categoria.findMany({
      where: { padreId: null },
      orderBy: { orden: 'asc' },
      include: {
        hijos: {
          orderBy: { orden: 'asc' },
          include: {
            _count: { select: { productos: true } },
          },
        },
        _count: { select: { productos: true } },
      },
    });
  }

  async findOne(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: {
        hijos: true,
        productos: true,
      },
    });
    if (!categoria)
      throw new NotFoundException(`Categoría #${id} no encontrada`);
    return categoria;
  }

  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    await this.findOne(id);
    return this.prisma.categoria.update({
      where: { id },
      data: updateCategoriaDto,
    });
  }

  async remove(id: number) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id },
      include: {
        productos: true,
        hijos: true,
      },
    });

    if (categoria && categoria.productos.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar: Esta categoría tiene productos asociados.',
      );
    }
    if (categoria && categoria.hijos.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar: Esta categoría tiene subcategorías asociadas.',
      );
    }
    return this.prisma.categoria.delete({
      where: { id },
    });
  }
}
