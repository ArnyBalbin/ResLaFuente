import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EstadoPedido } from '@prisma/client';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  async generarBalance(inicio: Date, fin: Date) {

    const ventas = await this.prisma.pedido.aggregate({
      where: {
        fecha: { gte: inicio, lte: fin },
        estado: EstadoPedido.CERRADO,
      },
      _sum: { total: true },
      _count: { id: true }
    });

    const totalVentas = Number(ventas._sum.total) || 0;
    const cantidadPedidos = ventas._count.id || 0;

    const pagosPorMetodo = await this.prisma.pago.groupBy({
      by: ['metodo'],
      where: {
        fecha: { gte: inicio, lte: fin }
      },
      _sum: { monto: true }
    });

    const egresos = await this.prisma.gasto.aggregate({
      where: {
        fecha: { gte: inicio, lte: fin }
      },
      _sum: { monto: true }
    });

    const totalEgresos = Number(egresos._sum.monto) || 0;

    const desgloseEgresos = await this.prisma.gasto.groupBy({
      by: ['esCosto'],
      where: { fecha: { gte: inicio, lte: fin } },
      _sum: { monto: true }
    });

    const costosVenta = Number(desgloseEgresos.find(e => e.esCosto === true)?._sum.monto || 0);
    const gastosOperativos = Number(desgloseEgresos.find(e => e.esCosto === false)?._sum.monto || 0);

    const rankingPlatos = await this.prisma.detallePedido.groupBy({
      by: ['productoId'],
      where: {
        pedido: { fecha: { gte: inicio, lte: fin }, estado: EstadoPedido.CERRADO }
      },
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: 5
    });

    const topProductos = await Promise.all(rankingPlatos.map(async (item) => {
      const prod = await this.prisma.producto.findUnique({ where: { id: item.productoId } });
      return {
        nombre: prod?.nombre || 'Desconocido',
        cantidad: item._sum.cantidad
      };
    }));

    return {
      periodo: { inicio, fin },
      resumenFinanciero: {
        ingresosTotales: totalVentas,
        egresosTotales: totalEgresos,
        utilidadNeta: totalVentas - totalEgresos,
        margen: totalVentas > 0 ? ((totalVentas - totalEgresos) / totalVentas * 100).toFixed(1) + '%' : '0%'
      },
      detalleIngresos: {
        ticketPromedio: cantidadPedidos > 0 ? (totalVentas / cantidadPedidos).toFixed(2) : 0,
        transacciones: cantidadPedidos,
        porMetodoPago: pagosPorMetodo.map(p => ({ metodo: p.metodo, total: p._sum.monto }))
      },
      detalleEgresos: {
        costosVenta: costosVenta,
        gastosOperativos: gastosOperativos
      },
      topProductos
    };
  }

  async reporteDiario() {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);
    return this.generarBalance(inicio, fin);
  }

  async reporteMensual(mes: number, anio: number) {
    const inicio = new Date(anio, mes - 1, 1);
    const fin = new Date(anio, mes, 0, 23, 59, 59);
    return this.generarBalance(inicio, fin);
  }
}