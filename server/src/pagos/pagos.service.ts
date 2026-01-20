import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoPedido } from '@prisma/client';
@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  async create(usuarioId: number, createPagoDto: CreatePagoDto) {
    const { pedidoId, monto, metodo, codigoOperacion } = createPagoDto;

    const caja = await this.prisma.cajaDiaria.findFirst({
      where: { usuarioId, estado: true }
    });
    if (!caja) {
      throw new BadRequestException('Debes abrir caja antes de recibir pagos.');
    }

    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { pagos: true }
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    if (pedido.estado === EstadoPedido.CERRADO) throw new BadRequestException('El pedido ya está cerrado y pagado.');

    const totalPagado = pedido.pagos.reduce((acc, p) => acc + Number(p.monto), 0);
    const deudaPendiente = Number(pedido.total) - totalPagado;

    if (monto > deudaPendiente) {
      throw new BadRequestException(`El monto excede la deuda pendiente (S/ ${deudaPendiente.toFixed(2)})`);
    }

    return this.prisma.$transaction(async (tx) => {
      const nuevoPago = await tx.pago.create({
        data: {
          pedidoId,
          cajaId: caja.id,
          monto,
          metodo,
          codigoOperacion,
          fecha: new Date(),
        }
      });

      const nuevoTotalPagado = totalPagado + monto;
      if (nuevoTotalPagado >= Number(pedido.total) - 0.01) {

        await tx.pedido.update({
          where: { id: pedidoId },
          data: { estado: EstadoPedido.CERRADO }
        });

        if (pedido.mesaId) {
          await tx.mesa.update({
            where: { id: pedido.mesaId },
            data: { ocupada: false }
          });
        }
      }

      return nuevoPago;
    });
  }

  findAll() {
    return this.prisma.pago.findMany({ include: { pedido: true } });
  }
}