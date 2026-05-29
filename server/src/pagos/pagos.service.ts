import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcesarPagoDto } from './dtos/procesar-pago.dto';
import { EstadoPedido, EstadoPago, MetodoPago, Prisma } from '@prisma/client';

@Injectable()
export class PagoService {
  private readonly logger = new Logger(PagoService.name);

  constructor(private readonly prisma: PrismaService) {}

  async procesarPagos(dto: ProcesarPagoDto, sucursalId: string, usuarioCajeroId: string) {
    return this.prisma.extended.$transaction(async (tx) => {
      // 1. Obtener y validar el pedido
      const pedido = await tx.pedido.findFirst({
        where: { id: dto.pedidoId, sucursalId },
        include: { pagos: true, convenio: true, cliente: true, mesas: true },
      });

      if (!pedido) throw new NotFoundException('El pedido no existe.');
      if (pedido.estado === EstadoPedido.CANCELADO) throw new ConflictException('No se puede cobrar un pedido cancelado.');
      if (pedido.estadoPago === EstadoPago.PAGADO) throw new ConflictException('Este pedido ya se encuentra totalmente pagado.');

      // 2. Calcular montos
      const totalPedido = Number(pedido.total);
      const montoYaPagado = pedido.pagos.reduce((acc, p) => acc + Number(p.monto), 0);
      const montoFaltante = totalPedido - montoYaPagado;
      
      const nuevoMontoAbonado = dto.pagos.reduce((acc, p) => acc + p.monto, 0);

      // Convertimos a string con toFixed para evitar errores de precisión de punto flotante en JS
      if (nuevoMontoAbonado > Number(montoFaltante.toFixed(2))) {
        throw new BadRequestException(`El monto enviado (S/ ${nuevoMontoAbonado}) supera el saldo pendiente del pedido (S/ ${montoFaltante}).`);
      }

      // 3. Validar requerimiento de Caja Abierta para dinero físico/digital directo
      const metodosRequierenCaja: MetodoPago[] = [MetodoPago.EFECTIVO, MetodoPago.TARJETA, MetodoPago.YAPE_PLIN];
      const usaCaja = dto.pagos.some(p => metodosRequierenCaja.includes(p.metodo));
      let cajaAbierta: { id: string } | null = null;

      if (usaCaja) {
        cajaAbierta = await tx.cajaDiaria.findFirst({
          where: { usuarioId: usuarioCajeroId, sucursalId, estado: true },
        });
        if (!cajaAbierta) {
          throw new ConflictException('Para procesar cobros en Efectivo, Tarjeta o Yape, debes abrir un turno de caja primero.');
        }
      }

      // 4. Procesar cada pago individualmente y evaluar líneas de crédito
      for (const detalle of dto.pagos) {
        
        // Regla: Crédito Empresa (El caso del límite diario del trabajador)
        if (detalle.metodo === MetodoPago.CREDITO_EMPRESA) {
          if (!pedido.convenioId || !pedido.convenio) {
            throw new BadRequestException('No se puede usar Crédito Empresa si el pedido no está asociado a un Convenio.');
          }

          // Calcular cuánto ha consumido el trabajador HOY
          const inicioDia = new Date(); inicioDia.setHours(0, 0, 0, 0);
          const finDia = new Date(); finDia.setHours(23, 59, 59, 999);

          const pagosHoy = await tx.pago.aggregate({
            where: {
              pedido: { convenioId: pedido.convenioId },
              metodo: MetodoPago.CREDITO_EMPRESA,
              fecha: { gte: inicioDia, lte: finDia },
            },
            _sum: { monto: true }
          });

          const consumidoHoy = Number(pagosHoy._sum.monto || 0);
          const limite = Number(pedido.convenio.limiteDiario);

          if ((consumidoHoy + detalle.monto) > limite) {
            const disponible = limite - consumidoHoy;
            throw new ConflictException(`El trabajador superó su límite diario. Su saldo disponible en la empresa hoy es S/ ${disponible.toFixed(2)}.`);
          }

          // Sumar deuda a la empresa matriz
          await tx.empresa.update({
            where: { id: pedido.convenio.empresaId },
            data: { creditoUsado: { increment: detalle.monto } }
          });
        }

        // Regla: Crédito Personal (Cuenta de cliente frecuente)
        if (detalle.metodo === MetodoPago.CREDITO_PERSONAL) {
          if (!pedido.clienteId || !pedido.cliente) {
            throw new BadRequestException('No se puede usar Crédito Personal si el pedido no está asociado a un Cliente con cuenta.');
          }

          const limite = Number(pedido.cliente.limiteCredito);
          const deudaActual = Number(pedido.cliente.saldoDeuda);

          if (pedido.cliente.tieneCredito === false || (deudaActual + detalle.monto > limite)) {
            throw new ConflictException(`El cliente no tiene crédito suficiente. Saldo disponible: S/ ${(limite - deudaActual).toFixed(2)}.`);
          }

          // Sumar deuda al cliente
          await tx.cliente.update({
            where: { id: pedido.clienteId },
            data: { saldoDeuda: { increment: detalle.monto } }
          });
        }

        // 5. Registrar el Pago en la base de datos
        await tx.pago.create({
          data: {
            pedidoId: pedido.id,
            cajaId: metodosRequierenCaja.includes(detalle.metodo) ? cajaAbierta!.id : null,
            monto: detalle.monto,
            metodo: detalle.metodo,
            codigoOperacion: detalle.codigoOperacion,
          }
        });
      }

      // 6. Actualizar el estado del Pedido y de las Mesas
      const estadoPago = (nuevoMontoAbonado === Number(montoFaltante.toFixed(2))) 
        ? EstadoPago.PAGADO 
        : EstadoPago.PAGADO_PARCIAL;

      const estadoOperativo = estadoPago === EstadoPago.PAGADO ? EstadoPedido.CERRADO : pedido.estado;

      const pedidoActualizado = await tx.pedido.update({
        where: { id: pedido.id },
        data: { 
          estadoPago,
          estado: estadoOperativo
        },
      });

      // Si se pagó por completo, liberamos las mesas para los siguientes clientes
      if (estadoPago === EstadoPago.PAGADO && pedido.mesas.length > 0) {
        const idsMesas = pedido.mesas.map(m => m.mesaId);
        await tx.mesa.updateMany({
          where: { id: { in: idsMesas } },
          data: { ocupada: false },
        });
      }

      return {
        message: estadoPago === EstadoPago.PAGADO ? 'Cobro completado y mesas liberadas.' : 'Pago parcial registrado exitosamente.',
        pedido: pedidoActualizado
      };
    });
  }

  async historialPagos(sucursalId: string, queryFilters?: { fechaInicio?: string; fechaFin?: string }) {
    const where: Prisma.PagoWhereInput = { 
      pedido: { sucursalId } 
    };

    if (queryFilters?.fechaInicio && queryFilters?.fechaFin) {
      const inicio = new Date(queryFilters.fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(queryFilters.fechaFin);
      fin.setHours(23, 59, 59, 999);
      where.fecha = { gte: inicio, lte: fin };
    }

    return this.prisma.extended.pago.findMany({
      where,
      include: {
        pedido: { select: { total: true, tipo: true } },
        caja: { include: { usuario: { select: { nombre: true } } } }
      },
      orderBy: { fecha: 'desc' },
    });
  }
}