import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventarioService {
  constructor(private prisma: PrismaService) {}

  async create(createInventarioDto: CreateInventarioDto) {
    const { productoId, tipo, cantidad, motivo } = createInventarioDto;

    const producto = await this.prisma.producto.findUnique({ where: { id: productoId } });
    if (!producto) throw new BadRequestException('Producto no encontrado');


    return await this.prisma.$transaction(async (tx) => {
      
      const movimiento = await tx.movimientoInventario.create({
        data: {
          productoId,
          tipo,
          cantidad,
          motivo,
          fecha: new Date()
        }
      });

      const operacion = tipo === 'ENTRADA' 
        ? { increment: cantidad } 
        : { decrement: cantidad };

      await tx.producto.update({
        where: { id: productoId },
        data: { stock: operacion }
      });

      return movimiento;
    });
  }

  findAll() {
    return this.prisma.movimientoInventario.findMany({
      include: { producto: true },
      orderBy: { fecha: 'desc' }
    });
  }

  findByProduct(productoId: number) {
    return this.prisma.movimientoInventario.findMany({
      where: { productoId },
      include: { producto: true },
      orderBy: { fecha: 'desc' }
    });
  }
}