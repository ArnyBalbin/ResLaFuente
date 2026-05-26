import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpresasService {
  constructor(private prisma: PrismaService) {}

  async create(createEmpresaDto: CreateEmpresaDto) {
    try {
      return await this.prisma.empresa.create({
        data: {
          ...createEmpresaDto,
          creditoUsado: 0,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una empresa con ese RUC');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.empresa.findMany({
      orderBy: { razonSocial: 'asc' },
      // CORREGIDO: Ahora contamos convenios activos
      include: { _count: { select: { convenios: true } } }
    });
  }

  async findOne(id: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      // CORREGIDO: Traemos los trabajadores a través de sus convenios
      include: { convenios: { include: { cliente: true } } }
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return empresa;
  }

  update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    return this.prisma.empresa.update({
      where: { id },
      data: updateEmpresaDto,
    });
  }

  async remove(id: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: { convenios: true, pedidosCredito: true }
    });

    // CORREGIDO: Validación de integridad histórica con convenios
    if (empresa && (empresa.convenios.length > 0 || empresa.pedidosCredito.length > 0)) {
      throw new BadRequestException('No se puede eliminar: La empresa tiene convenios asignados o historial de crédito.');
    }

    return this.prisma.empresa.delete({ where: { id } }); // Asegúrate si tu modelo compila con empresa o enterprise según tu renombre interno
  }

  async amortizarDeuda(id: number, monto: number) {
    const empresa = await this.findOne(id);
    const deudaActual = Number(empresa.creditoUsado);

    if (monto <= 0) throw new BadRequestException('El monto a pagar debe ser positivo');
    if (monto > deudaActual) throw new BadRequestException('No puedes pagar más de lo que deben');

    return this.prisma.empresa.update({
      where: { id },
      data: {
        creditoUsado: { decrement: monto }
      }
    });
  }
}