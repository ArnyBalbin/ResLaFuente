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
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una empresa con ese RUC');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.empresa.findMany({
      orderBy: { razonSocial: 'asc' },
      include: { _count: { select: { empleados: true } } }
    });
  }

  async findOne(id: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: { empleados: true }
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
      include: { empleados: true, pedidosCredito: true }
    });

    if (empresa && (empresa.empleados.length > 0 || empresa.pedidosCredito.length > 0)) {
      throw new BadRequestException('No se puede eliminar: La empresa tiene empleados o historial de crédito.');
    }

    return this.prisma.empresa.delete({ where: { id } });
  }

  async amortizarDeuda(id: number, monto: number) {
    const empresa = await this.findOne(id);

    const deudaActual = Number(empresa.creditoUsado);

    if (monto <= 0) throw new BadRequestException('El monto a pagar debe ser positivo');
    if (monto > deudaActual) throw new BadRequestException('No puedes pagar más de lo que deben');

    return this.prisma.empresa.update({
      where: { id },
      data: {
        creditoUsado: { decrement: monto } // Restamos la deuda
      }
    });
  }
}