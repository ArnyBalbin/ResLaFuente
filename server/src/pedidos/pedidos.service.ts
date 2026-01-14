import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    // 1. Desestructuramos los nuevos campos (esCredito, empresaId)
    const { mesaId, usuarioId, clienteId, detalles, esCredito, empresaId } = createPedidoDto;

    const mesa = await this.prisma.mesa.findUnique({ where: { id: mesaId } });
    if (!mesa) throw new NotFoundException('Mesa no encontrada');
    if (mesa.ocupada) throw new BadRequestException('Esta mesa ya está ocupada');

    let totalCalculado = 0;
    
    const detallesConPrecio: any[] = [];

    // 2. Calculamos el total y verificamos stock (Igual que antes)
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

    // 3. LOGICA DE CRÉDITO (Validación antes de guardar) <--- NUEVO
    if (esCredito && empresaId) {
      const empresa = await this.prisma.empresa.findUnique({ where: { id: empresaId } });
      
      if (!empresa) throw new BadRequestException('Empresa no encontrada');
      if (!empresa.tieneCredito) throw new BadRequestException('Esta empresa no tiene crédito habilitado');

      // Validar si tiene saldo suficiente (Limite - Usado >= Total Nuevo)
      const saldoDisponible = Number(empresa.limiteCredito) - Number(empresa.creditoUsado);
      
      if (totalCalculado > saldoDisponible) {
        throw new BadRequestException(`Crédito insuficiente. Disponible: S/ ${saldoDisponible.toFixed(2)}`);
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      
      // 4. Si es crédito, aumentamos la deuda de la empresa <--- NUEVO
      if (esCredito && empresaId) {
        await tx.empresa.update({
          where: { id: empresaId },
          data: { creditoUsado: { increment: totalCalculado } }
        });
      }

      const pedido = await tx.pedido.create({
        data: {
          mesaId,
          usuarioId,
          clienteId,
          // Guardamos info de crédito
          esCredito: esCredito || false, 
          empresaId: esCredito ? empresaId : null,
          
          total: totalCalculado,
          // Si es crédito, nace como 'POR_FACTURAR' (o PENDIENTE si prefieres que cocina lo vea igual)
          // Usaremos 'PENDIENTE' para asegurar que entre al flujo de cocina normal
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

      // 5. Descuento de inventario (Igual que antes)
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

  // OJO: Asegúrate que la cocina vea los pedidos aunque sean de crédito
  findForKitchen() {
    return this.prisma.pedido.findMany({
      where: {
        // Agregamos 'POR_FACTURAR' por si decidimos usar ese estado luego
        estado: { in: ['PENDIENTE', 'EN_PROCESO', 'POR_FACTURAR'] } 
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
      // Incluimos la empresa para ver quién paga en el listado general <--- NUEVO
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
        empresa: true, // <--- NUEVO: Incluir datos de la empresa pagadora
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