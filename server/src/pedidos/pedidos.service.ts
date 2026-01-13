import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const { mesaId, usuarioId, clienteId, detalles } = createPedidoDto;

    const mesa = await this.prisma.mesa.findUnique({ where: { id: mesaId } });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');
    if (mesa.ocupada) throw new BadRequestException('Esta mesa ya está ocupada');

    let totalCalculado = 0;
    
    const detallesConPrecio: any[] = [];

    for (const item of detalles) {
      const producto = await this.prisma.producto.findUnique({ where: { id: item.productoId } });
      
      if (!producto) throw new BadRequestException(`Producto ${item.productoId} no existe`);

      if (producto.esProductoFinal && (producto.stock || 0) < item.cantidad) {
         throw new BadRequestException(`No hay suficiente stock de ${producto.nombre}`);
      }

      totalCalculado += Number(producto.precio) * item.cantidad;
      
      detallesConPrecio.push({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        notas: item.notas
      });
    }

    return await this.prisma.$transaction(async (tx) => {
      
      const pedido = await tx.pedido.create({
        data: {
          mesaId,
          usuarioId,
          clienteId,
          total: totalCalculado,
          estado: 'PENDIENTE',
          detalles: {
            create: detallesConPrecio
          }
        },
        include: { detalles: true }
      });

      await tx.mesa.update({
        where: { id: mesaId },
        data: { ocupada: true }
      });

      for (const item of detalles) {
        const prod = await tx.producto.findUnique({ where: { id: item.productoId } });

        if (prod && prod.esProductoFinal) {
           await tx.producto.update({
             where: { id: prod.id },
             data: { stock: { decrement: item.cantidad } }
           });
           
           await tx.movimientoInventario.create({
             data: {
               productoId: prod.id,
               tipo: 'SALIDA',
               cantidad: item.cantidad,
               motivo: `Venta Pedido #${pedido.id}`
             }
           });
        }
      }

      return pedido;
    });
  }

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
      include: { mesa: true, usuario: true, detalles: true },
      orderBy: { fecha: 'desc' }
    });
  }

  async findOne(id: number) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        mesa: true,
        usuario: true,
        cliente: {
          include: { 
            empresa: true
          }
        },
        detalles: {
          include: { 
            producto: true
          }
        }
      }
    });

    if (!pedido) {
      throw new NotFoundException(`El pedido #${id} no existe`);
    }

    return pedido;
  }
}