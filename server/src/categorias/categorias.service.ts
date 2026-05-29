import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dtos/create-categoria.dto';
import { UpdateCategoriaDto } from './dtos/update-categoria.dto';

@Injectable()
export class CategoriaService {
  private readonly logger = new Logger(CategoriaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoriaDto, sucursalId: string) {
    // 1. Si enviaron un padreId, validar que exista y pertenezca a la misma sucursal
    if (dto.padreId) {
      await this.validarPadre(dto.padreId, sucursalId);
    }

    return this.prisma.extended.categoria.create({
      data: {
        ...dto,
        sucursalId,
      },
    });
  }

  async findAll(sucursalId: string, incluirHijos: boolean = false) {
    // Para el catálogo POS, a veces es mejor enviar el árbol estructurado
    return this.prisma.extended.categoria.findMany({
      where: { sucursalId, padreId: null }, // Traemos solo las categorías "Raíz"
      include: {
        hijos: incluirHijos ? { orderBy: { orden: 'asc' } } : false,
      },
      orderBy: { orden: 'asc' },
    });
  }

  async findOne(id: string, sucursalId: string) {
    const categoria = await this.prisma.extended.categoria.findFirst({
      where: { id, sucursalId },
      include: { hijos: true },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría no encontrada`);
    }

    return categoria;
  }

  async update(id: string, dto: UpdateCategoriaDto, sucursalId: string) {
    const categoriaActual = await this.findOne(id, sucursalId);

    if (dto.padreId) {
      // Regla de negocio: Una categoría no puede ser padre de sí misma
      if (id === dto.padreId) {
        throw new ConflictException('Una categoría no puede ser su propio padre.');
      }
      
      // Regla de negocio: Prevenir ciclos básicos y verificar pertenencia
      await this.validarPadre(dto.padreId, sucursalId);
    }

    return this.prisma.extended.categoria.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, sucursalId: string) {
    this.logger.log(`Validando eliminación de categoría: ${id}`);
    
    // Validamos que exista
    const categoria = await this.findOne(id, sucursalId);

    // Regla de negocio Enterprise: No borrar si está en uso (para mantener el historial limpio)
    const count = await this.prisma.extended.categoria.findFirst({
      where: { id },
      select: {
        _count: {
          select: { productos: true, hijos: true }
        }
      }
    });

    const totalProductos = count?._count?.productos ?? 0;
  const totalHijos = count?._count?.hijos ?? 0;

  if (totalProductos > 0 || totalHijos > 0) {
    throw new ConflictException(
      `No se puede eliminar la categoría '${categoria.nombre}'. Contiene ${totalProductos} productos y ${totalHijos} subcategorías. Mueve los elementos antes de eliminarla.`
    );
  }

    // El PrismaClientExceptionFilter intercepta esto como Soft Delete
    await this.prisma.extended.categoria.delete({
      where: { id },
    });

    return { message: 'Categoría eliminada exitosamente' };
  }

  // --- Métodos Privados Auxiliares ---
  private async validarPadre(padreId: string, sucursalId: string) {
    const padre = await this.prisma.extended.categoria.findFirst({
      where: { id: padreId, sucursalId },
    });

    if (!padre) {
      throw new ConflictException('La categoría padre especificada no existe en esta sucursal.');
    }
  }
}