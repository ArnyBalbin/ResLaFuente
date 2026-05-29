import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSucursalDto } from './dtos/create-sucursal.dto';
import { UpdateSucursalDto } from './dtos/update-sucursal.dto';

@Injectable()
export class SucursalService {
  private readonly logger = new Logger(SucursalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSucursalDto) {
    this.logger.log(`Creando nueva sucursal: ${dto.nombre}`);
    
    return this.prisma.extended.sucursal.create({
      data: {
        nombre: dto.nombre,
        direccion: dto.direccion,
      },
    });
  }

  async findAll(soloActivas: boolean = true) {
    return this.prisma.extended.sucursal.findMany({
      where: soloActivas ? { activa: true } : undefined,
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string) {
    const sucursal = await this.prisma.extended.sucursal.findUnique({
      where: { id },
    });

    if (!sucursal) {
      throw new NotFoundException(`La sucursal con ID ${id} no existe.`);
    }

    return sucursal;
  }

  async update(id: string, dto: UpdateSucursalDto) {
    // Validamos existencia previa para un mensaje de error más limpio
    await this.findOne(id);

    return this.prisma.extended.sucursal.update({
      where: { id },
      data: dto,
    });
  }

  async deactivate(id: string) {
    this.logger.log(`Desactivando sucursal ID: ${id}`);
    await this.findOne(id);

    // En lugar de borrar físicamente la sucursal (lo cual rompería el historial de facturación),
    // simplemente la apagamos mediante un Soft Disable (activa = false).
    return this.prisma.extended.sucursal.update({
      where: { id },
      data: { activa: false },
    });
  }
}