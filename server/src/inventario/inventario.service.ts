import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TipoMovimiento } from '@prisma/client';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async create(createMovimientoDto: CreateInventarioDto) {
    const { productoId, tipo, cantidad, costoUnitario, motivo } = createMovimientoDto;

    // 1. Verificar que el producto exista
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId }
    });

    if (!producto) throw new NotFoundException('Producto no encontrado');
    
    return this.prisma.$transaction(async (tx) => {
      const movimiento = await tx.movimientoInventario.create({
        data: {
          productoId,
          tipo,
          cantidad,
          motivo,
          costoUnitario: costoUnitario ? costoUnitario : producto.costo
        }
      });

      if (producto.controlarStock) {
        let nuevoStock = producto.stock;
        
        if (tipo === TipoMovimiento.ENTRADA) {
           nuevoStock += cantidad;

           if (costoUnitario) {
             await tx.producto.update({
               where: { id: productoId },
               data: { costo: costoUnitario }
             });
           }
        } else {
           nuevoStock -= cantidad;
        }

        await tx.producto.update({
          where: { id: productoId },
          data: { stock: nuevoStock }
        });
      }

      return movimiento;
    });
  }

  async findKardexByProducto(productoId: number) {
    return this.prisma.movimientoInventario.findMany({
      where: { productoId },
      orderBy: { fecha: 'desc' },
      take: 50
    });
  }
}