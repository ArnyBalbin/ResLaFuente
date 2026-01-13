import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpresasService {
  constructor(private prisma: PrismaService) {}

  async create(createEmpresaDto: CreateEmpresaDto) {
    // Validar que el RUC no exista ya
    const existe = await this.prisma.empresa.findUnique({
      where: { ruc: createEmpresaDto.ruc }
    });

    if (existe) {
      throw new BadRequestException('Ya existe una empresa con ese RUC');
    }

    return this.prisma.empresa.create({
      data: createEmpresaDto,
    });
  }

  findAll() {
    return this.prisma.empresa.findMany({
      where: { activo: true }, // Solo traemos las activas por defecto
      include: { empleados: true } // Opcional: ver quiénes trabajan ahí
    });
  }

  findOne(id: number) {
    return this.prisma.empresa.findUnique({
      where: { id },
      include: { empleados: true }
    });
  }

  update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    return this.prisma.empresa.update({
      where: { id },
      data: updateEmpresaDto,
    });
  }

  remove(id: number) {
    return this.prisma.empresa.update({
      where: { id },
      data: { activo: false } 
    });
  }
}