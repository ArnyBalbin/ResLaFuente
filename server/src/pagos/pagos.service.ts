import { Injectable, BadRequestException } from '@nestjs/common';
import { CreatePagoDto } from './dto/create-pago.dto';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  async create(createPagoDto: CreatePagoDto) {
    const { pedidoId, cajaId, metodo, monto, codigoOperacion } = createPagoDto;

    const pedido = await this.prisma.pedido.findUnique({ 
      where: { id: pedidoId },
      include: { mesa: true }
    });
    if (!pedido) throw new BadRequestException('Pedido no encontrado');
    if (pedido.estado === 'CERRADO') throw new BadRequestException('El pedido ya fue pagado');

    return await this.prisma.$transaction(async (tx) => {

      const nuevoPago = await tx.pago.create({
        data: {
          pedidoId,
          cajaId,
          monto,
          metodo,
          codigoOperacion,
        }
      });

      await tx.pedido.update({
        where: { id: pedidoId },
        data: { estado: 'CERRADO' }
      });

      await tx.mesa.update({
        where: { id: pedido.mesaId },
        data: { ocupada: false }
      });

      return nuevoPago;
    });
  }

  findAll() {
    return this.prisma.pago.findMany({ include: { pedido: true } });
  }
}