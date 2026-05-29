import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpresaDto } from './dtos/create-empresa.dto';
import { UpdateEmpresaDto } from './dtos/update-empresa.dto';

@Injectable()
export class EmpresaService {
  private readonly logger = new Logger(EmpresaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmpresaDto) {
    // Si la base de datos detecta un RUC duplicado, el PrismaClientExceptionFilter
    // lanzará automáticamente el error HTTP 409 Conflict.
    return this.prisma.extended.empresa.create({
      data: dto,
    });
  }

  async findAll(queryFilters?: { buscar?: string; conCredito?: boolean }) {
    const where: any = {};

    if (queryFilters?.buscar) {
      where.OR = [
        { razonSocial: { contains: queryFilters.buscar, mode: 'insensitive' } },
        { ruc: { contains: queryFilters.buscar } },
      ];
    }

    if (queryFilters?.conCredito !== undefined) {
      where.tieneCredito = queryFilters.conCredito;
    }

    return this.prisma.extended.empresa.findMany({
      where,
      orderBy: { razonSocial: 'asc' },
    });
  }

  async findOne(id: string) {
    const empresa = await this.prisma.extended.empresa.findUnique({
      where: { id },
      include: {
        // Traemos cuántos convenios activos tiene esta empresa sin traer toda la data
        _count: {
          select: { convenios: { where: { activo: true } } }
        }
      }
    });

    if (!empresa) {
      throw new NotFoundException(`La empresa corporativa no se encuentra registrada.`);
    }

    return empresa;
  }

  async update(id: string, dto: UpdateEmpresaDto) {
    const empresa = await this.findOne(id);

    // Regla de Negocio Crítica: Bloquear reducción de límite por debajo del uso actual
    if (dto.limiteCredito !== undefined && dto.limiteCredito < Number(empresa.creditoUsado)) {
      throw new ConflictException(
        `El nuevo límite (S/ ${dto.limiteCredito}) no puede ser menor al crédito ya utilizado (S/ ${empresa.creditoUsado}).`
      );
    }

    // Regla de Negocio Crítica: Bloquear revocación de crédito si hay deuda
    if (dto.tieneCredito === false && Number(empresa.creditoUsado) > 0) {
      throw new ConflictException(
        `No se puede revocar el crédito. La empresa mantiene una deuda activa de S/ ${empresa.creditoUsado}.`
      );
    }

    return this.prisma.extended.empresa.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    this.logger.log(`Validando eliminación de Empresa ID: ${id}`);
    const empresa = await this.findOne(id);

    // 1. Proteger deudas
    if (Number(empresa.creditoUsado) > 0) {
      throw new ConflictException(
        `Operación denegada. La empresa tiene un saldo corporativo pendiente de S/ ${empresa.creditoUsado}.`
      );
    }

    // 2. Proteger dependencias (Convenios)
    if (empresa._count.convenios > 0) {
      throw new ConflictException(
        `La empresa '${empresa.razonSocial}' tiene ${empresa._count.convenios} convenio(s) de trabajadores activos. Debe desactivarlos primero.`
      );
    }

    // Soft Delete (Manejado por Prisma Extension)
    await this.prisma.extended.empresa.delete({
      where: { id },
    });

    return { message: 'Empresa eliminada exitosamente del directorio.' };
  }
}