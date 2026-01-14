import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    // 1. Validar que el DNI no se repita (solo si viene DNI)
    if (createClienteDto.dni) {
      const existe = await this.prisma.cliente.findUnique({
        where: { dni: createClienteDto.dni }
      });
      if (existe) throw new BadRequestException('Ya existe un cliente con este DNI');
    }

    // 2. Validar que la empresa exista (si viene empresaId)
    if (createClienteDto.empresaId) {
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: createClienteDto.empresaId }
      });
      if (!empresa) throw new BadRequestException('La empresa especificada no existe');
    }

    // 3. Crear el Cliente
    return this.prisma.cliente.create({
      data: createClienteDto
    });
  }

  findAll() {
    return this.prisma.cliente.findMany({
      include: { 
        empresa: true // Traemos los datos de la empresa para ver dónde trabaja
      },
      orderBy: { nombre: 'asc' }
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: { empresa: true }
    });

    if (!cliente) throw new NotFoundException(`El cliente #${id} no existe`);
    return cliente;
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    // Validar existencia antes de actualizar
    await this.findOne(id);

    // Validar DNI duplicado si se está actualizando
    if (updateClienteDto.dni) {
      const existe = await this.prisma.cliente.findUnique({
        where: { dni: updateClienteDto.dni }
      });
      // Ojo: Validamos que exista Y que no sea el mismo cliente que estamos editando
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
    await this.findOne(id); // Validar que existe
    return this.prisma.cliente.delete({
      where: { id }
    });
  }
}