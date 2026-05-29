import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dtos/create-cliente.dto';
import { UpdateClienteDto } from './dtos/update-cliente.dto';

@Injectable()
export class ClienteService {
  private readonly logger = new Logger(ClienteService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClienteDto) {
    // El PrismaClientExceptionFilter manejará automáticamente los DNI/RUC duplicados
    return this.prisma.extended.cliente.create({
      data: dto,
    });
  }

  async findAll(queryFilters?: { buscar?: string; conCredito?: boolean; conDeuda?: boolean }) {
    const where: any = {};

    if (queryFilters?.buscar) {
      where.OR = [
        { nombre: { contains: queryFilters.buscar, mode: 'insensitive' } },
        { dni: { contains: queryFilters.buscar } },
        { ruc: { contains: queryFilters.buscar } },
      ];
    }

    if (queryFilters?.conCredito !== undefined) {
      where.tieneCredito = queryFilters.conCredito;
    }

    if (queryFilters?.conDeuda) {
      where.saldoDeuda = { gt: 0 };
    }

    return this.prisma.extended.cliente.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string) {
    const cliente = await this.prisma.extended.cliente.findUnique({
      where: { id },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente no encontrado en el sistema`);
    }

    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto) {
    await this.findOne(id); // Validar existencia

    // Prevenir inconsistencias crediticias: 
    // No se puede quitar la línea de crédito si el cliente aún tiene deuda.
    if (dto.tieneCredito === false) {
      const cliente = await this.findOne(id);
      if (Number(cliente.saldoDeuda) > 0) {
        throw new ConflictException(
          `No se puede revocar el crédito. El cliente mantiene una deuda activa de S/ ${cliente.saldoDeuda}.`
        );
      }
    }

    return this.prisma.extended.cliente.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    this.logger.log(`Validando eliminación de cliente ID: ${id}`);
    const cliente = await this.findOne(id);

    // Regla de Negocio 1: No eliminar clientes con cuentas por cobrar
    if (Number(cliente.saldoDeuda) > 0) {
      throw new ConflictException(
        `Operación denegada. El cliente tiene un saldo pendiente de pago de S/ ${cliente.saldoDeuda}.`
      );
    }

    // Regla de Negocio 2: Integridad del historial de facturación
    const count = await this.prisma.extended.cliente.findFirst({
      where: { id },
      select: {
        _count: {
          select: { pedidos: true, convenios: true }
        }
      }
    });

    const totalPedidos = count?._count?.pedidos ?? 0;

    if (totalPedidos > 0) {
      throw new ConflictException(
        `El cliente '${cliente.nombre}' tiene facturas/comandas históricas registradas. Por normativas de auditoría, no puede ser eliminado.`
      );
    }

    await this.prisma.extended.cliente.delete({
      where: { id },
    });

    return { message: 'Cliente eliminado exitosamente' };
  }
}