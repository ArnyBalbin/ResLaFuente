import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConvenioDto } from './dtos/create-convenio.dto';
import { UpdateConvenioDto } from './dtos/update-convenio.dto';

@Injectable()
export class ConvenioTrabajadorService {
  private readonly logger = new Logger(ConvenioTrabajadorService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateConvenioDto) {
    // 1. Validar existencia y estado de la Empresa
    const empresa = await this.prisma.extended.empresa.findUnique({
      where: { id: dto.empresaId },
    });

    if (!empresa) {
      throw new NotFoundException('La empresa especificada no existe en el directorio.');
    }

    if (!empresa.tieneCredito) {
      throw new ConflictException(
        `Operación denegada. La empresa '${empresa.razonSocial}' no tiene una línea de crédito corporativa habilitada.`
      );
    }

    // 2. Validar existencia del Cliente (Trabajador)
    const cliente = await this.prisma.extended.cliente.findUnique({
      where: { id: dto.clienteId },
    });

    if (!cliente) {
      throw new NotFoundException('El cliente (trabajador) no existe en el directorio.');
    }

    // 3. Crear Convenio (Prisma interceptará el unique constraint si ya existe)
    return this.prisma.extended.convenioTrabajador.create({
      data: dto,
      include: {
        cliente: { select: { nombre: true, dni: true } },
        empresa: { select: { razonSocial: true } },
      }
    });
  }

  async findAll(queryFilters?: { empresaId?: string; clienteId?: string; activo?: boolean }) {
    const where: any = {};

    if (queryFilters?.empresaId) where.empresaId = queryFilters.empresaId;
    if (queryFilters?.clienteId) where.clienteId = queryFilters.clienteId;
    if (queryFilters?.activo !== undefined) where.activo = queryFilters.activo;

    return this.prisma.extended.convenioTrabajador.findMany({
      where,
      include: {
        cliente: { select: { nombre: true, dni: true } },
        empresa: { select: { razonSocial: true, ruc: true } },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string) {
    const convenio = await this.prisma.extended.convenioTrabajador.findUnique({
      where: { id },
      include: {
        cliente: true,
        empresa: true,
      },
    });

    if (!convenio) {
      throw new NotFoundException(`El convenio no existe.`);
    }

    return convenio;
  }

  async update(id: string, dto: UpdateConvenioDto) {
    await this.findOne(id); // Valida que exista antes de intentar actualizar

    return this.prisma.extended.convenioTrabajador.update({
      where: { id },
      data: dto,
      include: {
        cliente: { select: { nombre: true } },
        empresa: { select: { razonSocial: true } },
      }
    });
  }

  async remove(id: string) {
    this.logger.log(`Intentando eliminar convenio ID: ${id}`);
    const convenio = await this.findOne(id);

    // Regla de Negocio: No borrar si ya se usó para procesar comandas (integridad referencial).
    const count = await this.prisma.extended.convenioTrabajador.findFirst({
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
        `El convenio del trabajador '${convenio.cliente.nombre}' ya tiene ${totalPedidos} pedido(s) histórico(s). No se puede eliminar de la base de datos. Para inhabilitarlo, actualice el estado 'activo' a false.`
      );
    }

    await this.prisma.extended.convenioTrabajador.delete({
      where: { id },
    });

    return { message: 'Convenio eliminado exitosamente.' };
  }
}