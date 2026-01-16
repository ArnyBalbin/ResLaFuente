import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePedidoDto, TipoPedido } from './dto/create-pedido.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const { 
      mesaId, usuarioId, clienteId, detalles, 
      esCredito, empresaId, tipo, direccion 
    } = createPedidoDto;

    const esPedidoMesa = !tipo || tipo === TipoPedido.MESA;

    if (esPedidoMesa) {
      if (!mesaId) throw new BadRequestException('Se requiere el ID de la mesa para pedidos de salón');
      
      const mesa = await this.prisma.mesa.findUnique({ where: { id: mesaId } });
      if (!mesa) throw new NotFoundException('Mesa no encontrada');
      if (mesa.ocupada) throw new BadRequestException('Esta mesa ya está ocupada');
    }

    let totalCalculado = 0;
    const detallesConPrecio: any[] = [];

    for (const item of detalles) {
      const producto = await this.prisma.producto.findUnique({ where: { id: item.productoId } });
      
      if (!producto) throw new BadRequestException(`Producto ${item.productoId} no existe`);

      if (producto.esProductoFinal && (producto.stock || 0) < item.cantidad) {
         throw new BadRequestException(`Stock insuficiente para ${producto.nombre}`);
      }

      totalCalculado += Number(producto.precio) * item.cantidad;
      
      detallesConPrecio.push({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
        notas: item.notas
      });
    }

    if (esCredito && empresaId) {
      const empresa = await this.prisma.empresa.findUnique({ where: { id: empresaId } });
      if (!empresa) throw new BadRequestException('Empresa no encontrada');
      if (!empresa.tieneCredito) throw new BadRequestException('Empresa sin crédito habilitado');
      
      const saldoDisponible = Number(empresa.limiteCredito) - Number(empresa.creditoUsado);
      if (totalCalculado > saldoDisponible) {
        throw new BadRequestException(`Línea de crédito excedida. Disponible: S/ ${saldoDisponible.toFixed(2)}`);
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      // Aumentar deuda empresa
      if (esCredito && empresaId) {
        await tx.empresa.update({
          where: { id: empresaId },
          data: { creditoUsado: { increment: totalCalculado } }
        });
      }

      const pedido = await tx.pedido.create({
        data: {
          mesaId: esPedidoMesa ? mesaId : null,
          usuarioId,
          clienteId,
          esCredito: esCredito || false, 
          empresaId: esCredito ? empresaId : null,
          
          tipo: tipo || TipoPedido.MESA,
          direccion: direccion || null,
          
          total: totalCalculado,
          estado: 'PENDIENTE', 
          
          detalles: {
            create: detallesConPrecio
          }
        },
        include: { detalles: true }
      });

      if (esPedidoMesa && mesaId) {
        await tx.mesa.update({
          where: { id: mesaId },
          data: { ocupada: true }
        });
      }

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