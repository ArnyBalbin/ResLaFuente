import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dtos/create-pedido.dto';
import { UpdateEstadoPedidoDto } from './dtos/update-estado-pedido.dto';
import { AnularPedidoDto } from './dtos/anular-pedido.dto';
import { EstadoPedido, TipoPedido, Prisma } from '@prisma/client';

@Injectable()
export class PedidoService {
  private readonly logger = new Logger(PedidoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePedidoDto, sucursalId: string, usuarioId: string) {
    // 1. Validaciones de Negocio Estrictas
    if (dto.clienteId && dto.convenioId) {
      throw new BadRequestException('Un pedido no puede pertenecer a un cliente personal y a un convenio B2B simultáneamente.');
    }

    if (dto.tipo === TipoPedido.MESA && (!dto.mesasIds || dto.mesasIds.length === 0)) {
      throw new BadRequestException('Para pedidos de salón (MESA), debe especificar al menos una mesa.');
    }

    if (dto.tipo === TipoPedido.DELIVERY && !dto.direccion) {
      throw new BadRequestException('Los pedidos de DELIVERY requieren una dirección de entrega.');
    }

    // 2. Cálculo inmutable del Total (Backend Authority)
    const totalCalculado = dto.detalles.reduce((acc, det) => {
      return acc + (det.cantidad * det.precioUnitario);
    }, 0);

    // 3. Ejecución Transaccional (ACID)
    return this.prisma.extended.$transaction(async (tx) => {
      
      // A. Validar mesas si es necesario
      if (dto.mesasIds && dto.mesasIds.length > 0) {
        const mesasCount = await tx.mesa.count({
          where: { id: { in: dto.mesasIds }, sucursalId }
        });
        if (mesasCount !== dto.mesasIds.length) {
          throw new ConflictException('Una o más mesas especificadas no existen en esta sucursal.');
        }
      }

      // B. Crear cabecera del pedido
      const pedido = await tx.pedido.create({
        data: {
          sucursalId,
          usuarioId,
          clienteId: dto.clienteId,
          convenioId: dto.convenioId,
          tipo: dto.tipo,
          direccion: dto.direccion,
          total: totalCalculado, // Guardamos el total calculado, no confiamos ciegamente en el front
          estado: EstadoPedido.PENDIENTE,
        },
      });

      // C. Asociar mesas (Fusión de mesas soportada)
      if (dto.mesasIds && dto.mesasIds.length > 0) {
        const mesasData = dto.mesasIds.map(mesaId => ({
          pedidoId: pedido.id,
          mesaId,
        }));
        await tx.pedidoMesa.createMany({ data: mesasData });

        // Marcar mesas como ocupadas
        await tx.mesa.updateMany({
          where: { id: { in: dto.mesasIds } },
          data: { ocupada: true },
        });
      }

      // D. Insertar Detalles
      const detallesData = dto.detalles.map(det => ({
        pedidoId: pedido.id,
        productoId: det.productoId,
        menuId: det.menuId,
        cantidad: det.cantidad,
        precioUnitario: det.precioUnitario,
        notas: det.notas,
      }));
      await tx.detallePedido.createMany({ data: detallesData });

      return pedido;
    });
  }

  async findAll(sucursalId: string, queryFilters?: { estado?: EstadoPedido; tipo?: TipoPedido; fecha?: string }) {
    const where: Prisma.PedidoWhereInput = { sucursalId };

    if (queryFilters?.estado) where.estado = queryFilters.estado;
    if (queryFilters?.tipo) where.tipo = queryFilters.tipo;
    
    // Si envían fecha, buscamos los pedidos de ese día exacto
    if (queryFilters?.fecha) {
      const inicioDia = new Date(queryFilters.fecha);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(queryFilters.fecha);
      finDia.setHours(23, 59, 59, 999);
      where.fecha = { gte: inicioDia, lte: finDia };
    }

    return this.prisma.extended.pedido.findMany({
      where,
      include: {
        usuario: { select: { nombre: true } },
        mesas: { include: { mesa: { select: { numero: true, salon: true } } } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async findOne(id: string, sucursalId: string) {
    const pedido = await this.prisma.extended.pedido.findFirst({
      where: { id, sucursalId },
      include: {
        usuario: { select: { nombre: true, rol: true } },
        cliente: true,
        convenio: { include: { empresa: true, cliente: true } },
        mesas: { include: { mesa: true } },
        detalles: {
          include: {
            producto: { select: { nombre: true, areaDespacho: true } },
            menu: { select: { nombre: true } }
          }
        },
        pagos: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException(`El pedido especificado no existe o no pertenece a esta sucursal.`);
    }

    return pedido;
  }

  async updateEstado(id: string, dto: UpdateEstadoPedidoDto, sucursalId: string) {
    const pedido = await this.findOne(id, sucursalId);

    if (pedido.estado === EstadoPedido.CANCELADO || pedido.estado === EstadoPedido.CERRADO) {
      throw new ConflictException(`No se puede modificar el estado de un pedido que ya está ${pedido.estado}.`);
    }

    return this.prisma.extended.pedido.update({
      where: { id },
      data: { estado: dto.estado },
    });
  }

  async anularPedido(id: string, dto: AnularPedidoDto, sucursalId: string, usuarioAdminId: string) {
    this.logger.log(`Anulación de pedido solicitada. Pedido: ${id}, Admin: ${usuarioAdminId}`);
    const pedido = await this.findOne(id, sucursalId);

    if (pedido.estado === EstadoPedido.CERRADO) {
      throw new ConflictException('Un pedido cerrado y cobrado no puede ser anulado mediante este flujo. Requiere extorno de pago.');
    }

    return this.prisma.extended.$transaction(async (tx) => {
      // 1. Marcar como cancelado y guardar el motivo
      const pedidoCancelado = await tx.pedido.update({
        where: { id },
        data: { 
          estado: EstadoPedido.CANCELADO,
          motivoAnulacion: dto.motivoAnulacion,
        },
      });

      // 2. Liberar las mesas asociadas a este pedido
      const mesasAsociadas = await tx.pedidoMesa.findMany({
        where: { pedidoId: id },
        select: { mesaId: true }
      });

      if (mesasAsociadas.length > 0) {
        const idsMesas = mesasAsociadas.map(m => m.mesaId);
        await tx.mesa.updateMany({
          where: { id: { in: idsMesas } },
          data: { ocupada: false },
        });
      }

      return pedidoCancelado;
    });
  }
}