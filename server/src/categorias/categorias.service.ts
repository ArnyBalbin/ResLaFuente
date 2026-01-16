import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriasService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoriaDto: CreateCategoriaDto) {
    if (createCategoriaDto.padreId) {
       const padre = await this.prisma.categoria.findUnique({ where: { id: createCategoriaDto.padreId }});
       if (!padre) throw new NotFoundException('La categoría padre no existe');
    }
    
    return this.prisma.categoria.create({
      data: createCategoriaDto,
    });
  }

  async findAll() {
    return this.prisma.categoria.findMany({
      where: {
        padreId: null,
      },
      include: {
        hijos: {
           orderBy: { nombre: 'asc' },
           include: {
              _count: { select: { productos: true } }
           }
        }, 
        _count: { select: { productos: true } }
      },
      orderBy: { nombre: 'asc' },
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
    if (!categoria) throw new NotFoundException(`Categoría #${id} no encontrada`);
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