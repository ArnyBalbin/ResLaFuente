import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AbrirCajaDto, CerrarCajaDto } from './dto/create-caja.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CajaService {
  constructor(private prisma: PrismaService) {}

  async abrir(usuarioId: number, abrirCajaDto: AbrirCajaDto) {
    const cajaAbierta = await this.prisma.cajaDiaria.findFirst({
      where: { usuarioId, estado: true },
    });
    if (cajaAbierta) {
      throw new ConflictException('Ya tienes una caja abierta. Ciérrala antes de abrir otra.');
    }

    return this.prisma.cajaDiaria.create({
      data: {
        usuarioId,
        montoInicial: abrirCajaDto.montoInicial,
        fechaApertura: new Date(),
        estado: true,
      },
    });
  }

  async cerrar(usuarioId: number, cerrarCajaDto: CerrarCajaDto) {
    const caja = await this.prisma.cajaDiaria.findFirst({
      where: { usuarioId, estado: true },
    });
    if (!caja) throw new NotFoundException('No tienes una caja abierta para cerrar.');

    return this.prisma.cajaDiaria.update({
      where: { id: caja.id },
      data: {
        fechaCierre: new Date(),
        montoFinal: cerrarCajaDto.montoFinal,
        observaciones: cerrarCajaDto.observaciones,
        estado: false,
      },
    });
  }

  async obtenerCajaAbierta(usuarioId: number) {
    const caja = await this.prisma.cajaDiaria.findFirst({
      where: { usuarioId, estado: true },
      include: {
         pagos: true,
         gastos: true
      }
    });
    return caja || null;
  }
}