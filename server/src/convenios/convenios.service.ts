import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConveniosService {
  constructor(private prisma: PrismaService) {}

  async asignarTrabajador(clienteId: number, empresaId: number, limiteDiario: number) {
    // Validar que no exista un convenio duplicado activo
    const existe = await this.prisma.convenioTrabajador.findUnique({
      where: { clienteId_empresaId: { clienteId, empresaId } }
    });

    if (existe) {
      return this.prisma.convenioTrabajador.update({
        where: { id: existe.id },
        data: { limiteDiario, activo: true }
      });
    }

    return this.prisma.convenioTrabajador.create({
      data: { clienteId, empresaId, limiteDiario }
    });
  }

  async desactivarConvenio(id: number) {
    return this.prisma.convenioTrabajador.update({
      where: { id },
      data: { activo: false }
    });
  }
}