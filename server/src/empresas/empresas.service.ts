import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpresasService {
  constructor(private prisma: PrismaService) {}

  async create(createEmpresaDto: CreateEmpresaDto) {
    // 1. Validar RUC único
    const existe = await this.prisma.empresa.findUnique({
      where: { ruc: createEmpresaDto.ruc }
    });
    
    if (existe) throw new BadRequestException('Ya existe una empresa con este RUC');

    // 2. Crear Empresa
    return this.prisma.empresa.create({
      data: {
        razonSocial: createEmpresaDto.razonSocial,
        ruc: createEmpresaDto.ruc,
        direccion: createEmpresaDto.direccion,
        telefono: createEmpresaDto.telefono,
        tieneCredito: createEmpresaDto.tieneCredito || false,
        limiteCredito: createEmpresaDto.limiteCredito || 0,
        diaCierre: createEmpresaDto.diaCierre || 30
      }
    });
  }

  findAll() {
    return this.prisma.empresa.findMany({
      include: {
        _count: { select: { empleados: true } } // Para saber cuántos empleados tiene
      },
      orderBy: { razonSocial: 'asc' }
    });
  }

  async findOne(id: number) {
    const empresa = await this.prisma.empresa.findUnique({ 
      where: { id },
      include: { empleados: true }
    });
    if (!empresa) throw new BadRequestException('Empresa no encontrada');
    return empresa;
  }

  update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    return this.prisma.empresa.update({
      where: { id },
      data: updateEmpresaDto,
    });
  }

  async remove(id: number) {
    // Validar si tiene empleados o deuda antes de borrar
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: { empleados: true, pedidosCredito: true }
    });

    if (empresa && (empresa.empleados.length > 0 || empresa.pedidosCredito.length > 0)) {
      throw new BadRequestException('No se puede eliminar: La empresa tiene empleados o historial de crédito.');
    }

    return this.prisma.empresa.delete({ where: { id } });
  }
}