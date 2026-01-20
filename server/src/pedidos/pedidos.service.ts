import { 
  Injectable, 
  BadRequestException, 
  NotFoundException, 
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePedidoDto, DetallePedidoItemDto } from './dto/create-pedido.dto';
import { EstadoPedido } from '@prisma/client';

@Injectable()
export class PedidosService {
  constructor(private prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const { items, mesaId, empresaId, esCredito, ...datosPedido } = createPedidoDto;

    if (mesaId) {
      const mesa = await this.prisma.mesa.findUnique({ where: { id: mesaId } });
      if (!mesa) throw new NotFoundException('La mesa no existe');
      if (mesa.ocupada) throw new ConflictException(`La mesa ${mesa.numero} ya está ocupada`);
    }

    const allProductIds = new Set<number>();
    const extractIds = (list: DetallePedidoItemDto[]) => {
      list.forEach(i => {
        allProductIds.add(i.productoId);
        if (i.componentes) extractIds(i.componentes);
      });
    };
    extractIds(items);

    const productosDb = await this.prisma.producto.findMany({
      where: { id: { in: Array.from(allProductIds) } }
    });

    const productoMap = new Map(productosDb.map(p => [p.id, p]));
    let totalCalculado = 0;

    return this.prisma.$transaction(async (tx) => {

      if (esCredito) {
        if (!empresaId) throw new BadRequestException('Falta empresaId para crédito');
        
        const empresa = await tx.empresa.findUnique({ where: { id: empresaId } });
        if (!empresa) throw new NotFoundException('Empresa no encontrada');
        if (!empresa.tieneCredito) throw new BadRequestException('Esta empresa no tiene línea de crédito activa');
      }

      const pedido = await tx.pedido.create({
        data: {
          ...datosPedido,
          mesaId,
          empresaId: esCredito ? empresaId : null,
          esCredito,
          total: 0,
          estado: EstadoPedido.PENDIENTE
        }
      });

      const procesarItem = async (item: DetallePedidoItemDto, padreId?: number) => {
        const producto = productoMap.get(item.productoId);
        if (!producto) throw new BadRequestException(`Producto ID ${item.productoId} no existe`);

        if (producto.controlarStock) {
          if (producto.stock < item.cantidad) {
            throw new BadRequestException(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
          }
          await tx.producto.update({
            where: { id: producto.id },
            data: { stock: { decrement: item.cantidad } }
          });
          await tx.movimientoInventario.create({
            data: {
              productoId: producto.id,
              tipo: 'SALIDA',
              cantidad: item.cantidad,
              motivo: `Venta Pedido #${pedido.id}`,
              costoUnitario: producto.costo
            }
          });
        }

        const subtotal = Number(producto.precio) * item.cantidad;
        totalCalculado += subtotal;

        // Insertar Detalle
        const detalle = await tx.detallePedido.create({
          data: {
            pedidoId: pedido.id,
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: producto.precio,
            notas: item.notas,
            detallePadreId: padreId
          }
        });

        if (item.componentes && item.componentes.length > 0) {
          for (const hijo of item.componentes) {
            await procesarItem(hijo, detalle.id);
          }
        }
      };

      for (const item of items) {
        await procesarItem(item);
      }

      if (esCredito && empresaId) {
        const empresa = await tx.empresa.findUniqueOrThrow({ where: { id: empresaId } });
        const saldoDisponible = Number(empresa.limiteCredito) - Number(empresa.creditoUsado);
        
        if (totalCalculado > saldoDisponible) {
          throw new BadRequestException(
            `Crédito insuficiente. Disponible: S/ ${saldoDisponible.toFixed(2)}, Pedido: S/ ${totalCalculado.toFixed(2)}`
          );
        }

        await tx.empresa.update({
          where: { id: empresaId },
          data: { creditoUsado: { increment: totalCalculado } }
        });
      }

      await tx.pedido.update({
        where: { id: pedido.id },
        data: { total: totalCalculado }
      });

      if (mesaId) {
        await tx.mesa.update({
          where: { id: mesaId },
          data: { ocupada: true }
        });
      }

      return pedido;
    });
  }
}