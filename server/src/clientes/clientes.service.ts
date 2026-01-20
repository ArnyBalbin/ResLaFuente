import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    if (createClienteDto.empresaId) {
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: createClienteDto.empresaId }
      });
      if (!empresa) throw new BadRequestException('La empresa especificada no existe');
    }

    try {
      return await this.prisma.cliente.create({
        data: createClienteDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un cliente con ese DNI o Email');
      }
      throw error;
    }
  }

  async findAll(query?: string) {
    if (!query) {
       return this.prisma.cliente.findMany({ 
         take: 20, 
         orderBy: { id: 'desc' },
         include: { empresa: true }
       });
    }
    
    return this.prisma.cliente.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { dni: { contains: query } }
        ]
      },
      include: { empresa: true }
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: { empresa: true, pedidos: true }
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    await this.findOne(id);

    if (updateClienteDto.dni) {
      const existe = await this.prisma.cliente.findUnique({
        where: { dni: updateClienteDto.dni }
      });
      if (existe && existe.id !== id) {
        throw new BadRequestException('Ya existe otro cliente con este DNI');
      }
    }

    return this.prisma.cliente.update({
      where: { id },
      data: updateClienteDto
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cliente.delete({
      where: { id }
    });
  }
}