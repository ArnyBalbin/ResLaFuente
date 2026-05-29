import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGastoDto } from '../dtos/create-gasto.dto';

@Injectable()
export class GastoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGastoDto, sucursalId: string, usuarioId: string) {
    // 1. Validar Categoría
    const categoria = await this.prisma.extended.categoriaGasto.findFirst({
      where: { 
        id: dto.categoriaId,
        OR: [{ sucursalId }, { sucursalId: null }]
      }
    });

    if (!categoria) {
      throw new ConflictException('La categoría contable especificada no es válida.');
    }

    // 2. Validar Caja (Si el dinero se saca del cajón)
    if (dto.cajaId) {
      const caja = await this.prisma.extended.cajaDiaria.findFirst({
        where: { id: dto.cajaId, sucursalId }
      });

      if (!caja) throw new NotFoundException('La caja especificada no existe.');
      if (!caja.estado) throw new ConflictException('No se puede registrar un gasto en una caja que ya está cerrada.');
      
      // Validar que la caja le pertenezca al usuario que está registrando el gasto (seguridad)
      if (caja.usuarioId !== usuarioId) {
        const usuario = await this.prisma.extended.usuario.findUnique({ where: { id: usuarioId } });
        if (usuario?.rol !== 'ADMIN') {
          throw new ConflictException('No puedes registrar un retiro de efectivo en la caja de otro empleado.');
        }
      }
    }

    return this.prisma.extended.gasto.create({
      data: {
        ...dto,
        sucursalId,
        usuarioId, // Registramos quién hizo el retiro/gasto para auditoría
      },
      include: {
        categoria: { select: { nombre: true, esCosto: true } }
      }
    });
  }

  async findAll(sucursalId: string, filtros?: { mes?: string; cajaId?: string }) {
    const where: any = { sucursalId };

    if (filtros?.cajaId) {
      where.cajaId = filtros.cajaId;
    }

    // Filtro por mes (Ej. "2026-05") para el Estado de Resultados
    if (filtros?.mes) {
      const inicioMes = new Date(`${filtros.mes}-01T00:00:00.000Z`);
      const finMes = new Date(inicioMes.getFullYear(), inicioMes.getMonth() + 1, 0, 23, 59, 59, 999);
      where.fecha = { gte: inicioMes, lte: finMes };
    }

    return this.prisma.extended.gasto.findMany({
      where,
      include: {
        categoria: true,
        usuario: { select: { nombre: true } },
        caja: { select: { fechaApertura: true } }
      },
      orderBy: { fecha: 'desc' },
    });
  }
}