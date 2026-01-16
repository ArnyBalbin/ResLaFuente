import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePedidoDto, TipoPedido } from './dto/create-pedido.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  

  findForKitchen() {
    return this.prisma.pedido.findMany({
      where: {
        estado: { in: ['PENDIENTE', 'EN_PROCESO'] } 
      },
      include: {
        detalles: {
          include: { producto: true }
        },
        mesa: true
      },
      orderBy: { fecha: 'asc' }
    });
  }

  findAll() {
    return this.prisma.pedido.findMany({
      include: { 
        mesa: true, 
        usuario: true, 
        detalles: true,
        empresa: true 
      },
      orderBy: { fecha: 'desc' }
    });
  }

  async findOne(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        mesa: true,
        usuario: true,
        cliente: true,
        empresa: true,
        detalles: {
          include: { 
            producto: true
          }
        }
      }
    });

    if (!pedido) throw new NotFoundException(`Pedido #${id} no existe`);
    return pedido;
  }
}