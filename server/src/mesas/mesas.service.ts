import { Injectable } from '@nestjs/common';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MesasService {
  constructor(private prisma: PrismaService) {}

  async create(createMesaDto: CreateMesaDto) {
    const existe = await this.prisma.mesa.findUnique({
      where: { numero: createMesaDto.numero }
    });

    if (existe) {
      throw new Error(`La mesa ${createMesaDto.numero} ya existe`);
    }

    return this.prisma.mesa.create({
      data: createMesaDto,
    });
  }

  findAll() {
    return this.prisma.mesa.findMany({
      orderBy: {
        id: 'asc',
      },
      include: {
        pedidos: {
          where: { estado: 'PENDIENTE' },
          take: 1
        }
      }
    });
  }

  findOne(id: number) {
    return this.prisma.mesa.findUnique({
      where: { id },
    });
  }

  update(id: number, updateMesaDto: UpdateMesaDto) {
    return this.prisma.mesa.update({
      where: { id },
      data: updateMesaDto,
    });
  }

  remove(id: number) {
    return this.prisma.mesa.delete({
      where: { id },
    });
  }
}