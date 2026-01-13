import { Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  create(createClienteDto: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: createClienteDto,
    });
  }

  findAll() {
    return this.prisma.cliente.findMany({
      include: {
        empresa: true,
      },
      orderBy: { nombre: 'asc' }
    });
  }

  findOne(id: number) {
    return this.prisma.cliente.findUnique({
      where: { id },
      include: { empresa: true }
    });
  }

  async findByDoc(doc: string) {
    return this.prisma.cliente.findFirst({
      where: {
        OR: [
          { dni: doc },
          { ruc: doc }
        ]
      },
      include: { empresa: true }
    });
  }

  update(id: number, updateClienteDto: UpdateClienteDto) {
    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto,
    });
  }

  remove(id: number) {
    return this.prisma.cliente.delete({ where: { id } });
  }
}