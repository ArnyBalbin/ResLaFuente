import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async obtenerDashboard() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const hace7dias = new Date();
    hace7dias.setDate(hoy.getDate() - 7);

    const pagosHoy = await this.prisma.pago.aggregate({
      _sum: { monto: true },
      where: {
        fecha: { gte: hoy }
      }
    });

    const pedidosHoy = await this.prisma.pedido.count({
      where: {
        fecha: { gte: hoy },
        estado: 'CERRADO'
      }
    });

    const topProductosRaw = await this.prisma.detallePedido.groupBy({
      by: ['productoId'],
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: 5,
    });

    const topProductos = await Promise.all(topProductosRaw.map(async (item) => {
      const prod = await this.prisma.producto.findUnique({ where: { id: item.productoId }});
      return {
        nombre: prod?.nombre || 'Desconocido',
        cantidad: item._sum.cantidad
      };
    }));

    const pagosSemana = await this.prisma.pago.findMany({
      where: { fecha: { gte: hace7dias } },
      select: { fecha: true, monto: true }
    });

    const mapaVentas = new Map<string, number>();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' }); // "14/01"
      mapaVentas.set(key, 0);
    }

    pagosSemana.forEach(pago => {
      const key = new Date(pago.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
      if (mapaVentas.has(key)) {
        mapaVentas.set(key, mapaVentas.get(key)! + Number(pago.monto));
      }
    });

    const ventasPorDia = Array.from(mapaVentas, ([fecha, total]) => ({ fecha, total }));

    return {
      ventasHoy: pagosHoy._sum.monto || 0,
      pedidosHoy,
      topProductos,
      ventasPorDia
    };
  }
}