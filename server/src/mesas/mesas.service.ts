import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMesaDto } from './dtos/create-mesa.dto';
import { UpdateMesaDto } from './dtos/update-mesa.dto';

@Injectable()
export class MesaService {
  private readonly logger = new Logger(MesaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMesaDto, sucursalId: string) {
    // 1. Validar que el número de mesa no exista en esta sucursal específica
    await this.validarNumeroUnico(dto.numero, sucursalId);

    return this.prisma.extended.mesa.create({
      data: {
        ...dto,
        sucursalId,
      },
    });
  }

  async findAll(sucursalId: string, queryFilters?: { salon?: string; ocupada?: boolean }) {
    const where: any = { sucursalId };

    if (queryFilters?.salon) {
      where.salon = queryFilters.salon;
    }

    if (queryFilters?.ocupada !== undefined) {
      where.ocupada = queryFilters.ocupada;
    }

    return this.prisma.extended.mesa.findMany({
      where,
      orderBy: [
        { salon: 'asc' },
        { numero: 'asc' }, // Ordenamiento natural para el frontend
      ],
    });
  }

  async findOne(id: string, sucursalId: string) {
    const mesa = await this.prisma.extended.mesa.findFirst({
      where: { id, sucursalId },
    });

    if (!mesa) {
      throw new NotFoundException(`La mesa no existe en el local actual`);
    }

    return mesa;
  }

  async update(id: string, dto: UpdateMesaDto, sucursalId: string) {
    const mesaActual = await this.findOne(id, sucursalId);

    // Si se está cambiando el número, validar que el nuevo número no choque con otra mesa
    if (dto.numero && dto.numero !== mesaActual.numero) {
      await this.validarNumeroUnico(dto.numero, sucursalId);
    }

    return this.prisma.extended.mesa.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, sucursalId: string) {
    this.logger.log(`Intentando eliminar la mesa ID: ${id}`);
    const mesa = await this.findOne(id, sucursalId);

    // Regla Enterprise: No borrar si la mesa tiene un historial de pedidos asociados
    const count = await this.prisma.extended.mesa.findFirst({
      where: { id },
      select: {
        _count: {
          select: { pedidos: true }
        }
      }
    });

    const totalPedidos = count?._count?.pedidos ?? 0;

    if (totalPedidos > 0) {
      throw new ConflictException(
        `La mesa '${mesa.numero}' tiene un registro histórico de pedidos. No puede ser eliminada físicamente de la base de datos.`
      );
    }

    await this.prisma.extended.mesa.delete({
      where: { id },
    });

    return { message: 'Mesa eliminada exitosamente' };
  }

  // --- Validación Auxiliar ---
  private async validarNumeroUnico(numero: string, sucursalId: string) {
    const existe = await this.prisma.extended.mesa.findUnique({
      where: {
        sucursalId_numero: { sucursalId, numero },
      },
    });

    if (existe) {
      throw new ConflictException(`La mesa número '${numero}' ya está registrada en esta sucursal.`);
    }
  }
}