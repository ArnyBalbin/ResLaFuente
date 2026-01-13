import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCajaDto, CerrarCajaDto } from './dto/create-caja.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CajaService {
  constructor(private prisma: PrismaService) {}

  // 1. ABRIR CAJA
  async abrir(createCajaDto: CreateCajaDto) {
    // Verificar si el usuario ya tiene una caja abierta
    const cajaAbierta = await this.prisma.cajaDiaria.findFirst({
      where: {
        usuarioId: createCajaDto.usuarioId,
        fechaCierre: null // Significa que sigue abierta
      }
    });

    if (cajaAbierta) {
      throw new BadRequestException('Este usuario ya tiene una caja abierta. Debe cerrarla primero.');
    }

    return this.prisma.cajaDiaria.create({
      data: {
        usuarioId: createCajaDto.usuarioId,
        montoInicial: createCajaDto.montoInicial,
        estado: true // Abierta
      }
    });
  }

  // 2. CERRAR CAJA (ARQUEO)
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
        estado: false // Cerrada
      }
    });
  }

  // 3. CONSULTAR ESTADO ACTUAL (Para saber si puedo cobrar)
  async obtenerCajaAbierta(usuarioId: number) {
    const caja = await this.prisma.cajaDiaria.findFirst({
      where: {
        usuarioId,
        fechaCierre: null
      },
      include: {
        pagos: true // Ver cuánto se ha vendido en este turno
      }
    });
    return caja || { mensaje: 'No hay caja abierta' };
  }
}