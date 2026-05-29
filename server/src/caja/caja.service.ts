import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AbrirCajaDto } from './dtos/abrir-caja.dto';
import { CerrarCajaDto } from './dtos/cerrar-caja.dto';
import { MetodoPago } from '@prisma/client';

@Injectable()
export class CajaService {
  private readonly logger = new Logger(CajaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async abrirCaja(dto: AbrirCajaDto, sucursalId: string, usuarioId: string) {
    // 1. Regla de negocio: Un usuario solo puede tener una caja abierta a la vez en su sucursal
    const cajaAbierta = await this.obtenerCajaActual(sucursalId, usuarioId);
    
    if (cajaAbierta) {
      throw new ConflictException('Ya tienes un turno de caja abierto. Ciérralo antes de abrir uno nuevo.');
    }

    return this.prisma.extended.cajaDiaria.create({
      data: {
        sucursalId,
        usuarioId,
        montoInicial: dto.montoInicial,
        estado: true, // true = Abierta
      },
    });
  }

  async obtenerCajaActual(sucursalId: string, usuarioId: string) {
    return this.prisma.extended.cajaDiaria.findFirst({
      where: {
        sucursalId,
        usuarioId,
        estado: true, // Solo buscamos la caja activa
      },
    });
  }

  async cerrarCaja(cajaId: string, dto: CerrarCajaDto, sucursalId: string, usuarioId: string) {
    const caja = await this.prisma.extended.cajaDiaria.findFirst({
      where: { id: cajaId, sucursalId, estado: true },
      include: {
        pagos: true,
        gastos: true,
      }
    });

    if (!caja) {
      throw new NotFoundException('La caja no existe o ya se encuentra cerrada.');
    }

    // Seguridad: Solo el usuario dueño de la caja (o un Admin supremo) puede cerrarla
    if (caja.usuarioId !== usuarioId) {
      const usuario = await this.prisma.extended.usuario.findUnique({ where: { id: usuarioId } });
      if (usuario?.rol !== 'ADMIN') {
        throw new ConflictException('No tienes permisos para cerrar la caja de otro usuario.');
      }
    }

    // --- LÓGICA DE CIERRE CIEGO ---
    
    // A. Sumamos los ingresos físicos (SOLO EFECTIVO, las tarjetas/yape van a cuentas bancarias)
    const ingresosEfectivo = caja.pagos
      .filter(pago => pago.metodo === MetodoPago.EFECTIVO)
      .reduce((acc, pago) => acc + Number(pago.monto), 0);

    // B. Sumamos las salidas de dinero (Gastos sacados de esta caja específica)
    const egresosCaja = caja.gastos
      .reduce((acc, gasto) => acc + Number(gasto.monto), 0);

    // C. Cálculo del saldo teórico
    const esperadoEnCajon = Number(caja.montoInicial) + ingresosEfectivo - egresosCaja;

    // D. Detección de descuadre
    const montoDeclarado = Number(dto.montoFinal);
    const descuadre = montoDeclarado - esperadoEnCajon;
    
    let auditoriaObservaciones = dto.observaciones ? `${dto.observaciones} | ` : '';
    
    if (descuadre !== 0) {
      const tipoDescuadre = descuadre > 0 ? 'SOBRANTE' : 'FALTANTE';
      auditoriaObservaciones += `[AUDITORÍA DEL SISTEMA: ${tipoDescuadre} de S/ ${Math.abs(descuadre).toFixed(2)}. Esperado: S/ ${esperadoEnCajon.toFixed(2)}]`;
      this.logger.warn(`Descuadre detectado en caja ${caja.id}: ${tipoDescuadre} de ${Math.abs(descuadre)}`);
    } else {
      auditoriaObservaciones += '[AUDITORÍA DEL SISTEMA: CAJA CUADRADA EXACTA]';
    }

    // Actualizamos y cerramos
    return this.prisma.extended.cajaDiaria.update({
      where: { id: caja.id },
      data: {
        estado: false, // false = Cerrada
        fechaCierre: new Date(),
        montoFinal: dto.montoFinal,
        observaciones: auditoriaObservaciones.trim(),
      },
    });
  }

  async historialCajas(sucursalId: string, queryFilters?: { usuarioId?: string; fechaInicio?: string; fechaFin?: string }) {
    const where: any = { sucursalId };

    if (queryFilters?.usuarioId) {
      where.usuarioId = queryFilters.usuarioId;
    }

    if (queryFilters?.fechaInicio && queryFilters?.fechaFin) {
      where.fechaApertura = {
        gte: new Date(queryFilters.fechaInicio),
        lte: new Date(queryFilters.fechaFin),
      };
    }

    return this.prisma.extended.cajaDiaria.findMany({
      where,
      include: {
        usuario: { select: { nombre: true, rol: true } },
        _count: {
          select: { pagos: true, gastos: true }
        }
      },
      orderBy: { fechaApertura: 'desc' },
    });
  }
}