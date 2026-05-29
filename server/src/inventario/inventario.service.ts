import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovimientoDto } from './dtos/create-movimiento.dto';
import { TipoMovimiento } from '@prisma/client';

@Injectable()
export class InventarioService {
  private readonly logger = new Logger(InventarioService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrarMovimiento(dto: CreateMovimientoDto, sucursalId: string) {
    // 1. Validar que el producto exista en la sucursal actual (Tenant Isolation)
    const producto = await this.prisma.extended.producto.findFirst({
      where: { id: dto.productoId, sucursalId },
    });

    if (!producto) {
      throw new NotFoundException('El producto no existe en el catálogo de esta sucursal.');
    }

    if (!producto.controlarStock) {
      this.logger.warn(`Registrando movimiento para producto ${producto.nombre} que no tiene control de stock activo.`);
    }

    // 2. Validaciones de lógica de inventario
    if (dto.tipo === TipoMovimiento.ENTRADA && dto.cantidad <= 0) {
      throw new BadRequestException('Las ENTRADAS deben tener una cantidad positiva mayor a cero.');
    }

    if (dto.tipo === TipoMovimiento.SALIDA && dto.cantidad > 0) {
      // Forzamos a que las salidas se registren matemáticamente como restas
      dto.cantidad = -dto.cantidad; 
    }

    // 3. Ejecución Transaccional (ACID) - Modifica el Kardex y el Stock en tiempo real
    return this.prisma.extended.$transaction(async (tx) => {
      // Creamos el registro histórico
      const movimiento = await tx.movimientoInventario.create({
        data: {
          productoId: dto.productoId,
          tipo: dto.tipo,
          cantidad: dto.cantidad,
          motivo: dto.motivo,
          costoUnitario: dto.costoUnitario,
        },
      });

      // Actualizamos el stock real del producto
      await tx.producto.update({
        where: { id: dto.productoId },
        data: {
          stock: { increment: dto.cantidad },
        },
      });

      return movimiento;
    });
  }

  async obtenerKardex(sucursalId: string, queryFilters?: { productoId?: string; fechaInicio?: string; fechaFin?: string }) {
    const where: any = {
      producto: { sucursalId } // Aislamiento de Tenant a través de la relación
    };

    if (queryFilters?.productoId) {
      where.productoId = queryFilters.productoId;
    }

    if (queryFilters?.fechaInicio && queryFilters?.fechaFin) {
      const inicio = new Date(queryFilters.fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(queryFilters.fechaFin);
      fin.setHours(23, 59, 59, 999);
      where.fecha = { gte: inicio, lte: fin };
    }

    return this.prisma.extended.movimientoInventario.findMany({
      where,
      include: {
        producto: { select: { nombre: true, controlarStock: true, stock: true } },
      },
      orderBy: { fecha: 'desc' },
    });
  }

  async alertasStockMinimo(sucursalId: string) {
    // Retorna todos los productos controlados cuyo stock físico cayó por debajo o igual al umbral
    return this.prisma.extended.producto.findMany({
      where: {
        sucursalId,
        controlarStock: true,
        stock: { lte: this.prisma.extended.producto.fields.stockMinimo } // Stock actual <= Stock mínimo
      },
      select: {
        id: true,
        nombre: true,
        stock: true,
        stockMinimo: true,
        categoria: { select: { nombre: true } }
      },
      orderBy: { stock: 'asc' },
    });
  }
}