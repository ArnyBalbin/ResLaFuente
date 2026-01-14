import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCajaDto, CerrarCajaDto } from './dto/create-caja.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CajaService {
  constructor(private prisma: PrismaService) {}

  async abrir(createCajaDto: CreateCajaDto) {
    const cajaAbierta = await this.prisma.cajaDiaria.findFirst({
      where: {
        usuarioId: createCajaDto.usuarioId,
        fechaCierre: null
      }
    });

    if (cajaAbierta) {
      throw new BadRequestException('Este usuario ya tiene una caja abierta. Debe cerrarla primero.');
    }

    return this.prisma.cajaDiaria.create({
      data: {
        usuarioId: createCajaDto.usuarioId,
        montoInicial: createCajaDto.montoInicial,
        estado: true
      }
    });
  }

  async cerrar(id: number, cerrarCajaDto: CerrarCajaDto) {
    const caja = await this.prisma.cajaDiaria.findUnique({ where: { id } });
    
    if (!caja) throw new BadRequestException('Caja no encontrada');
    if (caja.fechaCierre) throw new BadRequestException('Esta caja ya está cerrada');

    return this.prisma.cajaDiaria.update({
      where: { id },
      data: {
        fechaCierre: new Date(),
        montoFinal: cerrarCajaDto.montoFinal,
        observaciones: cerrarCajaDto.observaciones,
        estado: false
      }
    });
  }

  async obtenerCajaAbierta(usuarioId: number) {
    const caja = await this.prisma.cajaDiaria.findFirst({
      where: {
        usuarioId,
        fechaCierre: null
      },
      include: {
        pagos: true
      }
    });
    return caja || { mensaje: 'No hay caja abierta' };
  }
}