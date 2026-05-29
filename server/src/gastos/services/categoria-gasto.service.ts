import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoriaGastoDto } from '../dtos/create-categoria-gasto.dto';

@Injectable()
export class CategoriaGastoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoriaGastoDto, sucursalId: string) {
    // El PrismaClientExceptionFilter manejará duplicados en el campo `nombre`
    return this.prisma.extended.categoriaGasto.create({
      data: {
        ...dto,
        sucursalId,
      },
    });
  }

  async findAll(sucursalId: string) {
    return this.prisma.extended.categoriaGasto.findMany({
      where: {
        OR: [
          { sucursalId }, 
          { sucursalId: null } // Soporta categorías maestras globales
        ]
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async remove(id: string) {
    // Proteger integridad contable: No borrar si ya tiene gastos asociados
    const count = await this.prisma.extended.categoriaGasto.findUnique({
      where: { id },
      include: { _count: { select: { gastos: true } } }
    });

    if (!count) throw new NotFoundException('Categoría no encontrada');
    if (count._count.gastos > 0) {
      throw new ConflictException(`No se puede eliminar la categoría. Tiene ${count._count.gastos} egreso(s) registrado(s) históricamente.`);
    }

    return this.prisma.extended.categoriaGasto.delete({ where: { id } });
  }
}