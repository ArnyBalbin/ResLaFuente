import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto) {
    const { convenioEmpresaId, convenioLimiteDiario, ...datosCliente } = createClienteDto;

    // 1. Validar que la empresa exista si se envió un convenio
    if (convenioEmpresaId) {
      const empresa = await this.prisma.empresa.findUnique({
        where: { id: convenioEmpresaId }
      });
      if (!empresa) throw new BadRequestException('La empresa especificada para el convenio no existe');
      if (!convenioLimiteDiario) throw new BadRequestException('Debe especificar un límite diario para el convenio');
    }

    try {
      // 2. Crear cliente y su convenio (si aplica) en una sola operación
      return await this.prisma.cliente.create({
        data: {
          ...datosCliente,
          convenios: convenioEmpresaId ? {
            create: {
              empresaId: convenioEmpresaId,
              limiteDiario: convenioLimiteDiario!
            }
          } : undefined
        },
        include: { convenios: true } // Para devolver el dato completo al frontend
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un cliente con ese DNI, RUC o Email');
      }
      throw error;
    }
  }

  async findAll(query?: string) {
    const includeRelations = { 
      convenios: { include: { empresa: true } }
    };

    if (!query) {
       return this.prisma.cliente.findMany({ 
         take: 20, 
         orderBy: { id: 'desc' },
         include: includeRelations
       });
    }
    
    return this.prisma.cliente.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { dni: { contains: query } }
        ]
      },
      include: includeRelations
    });
  }

  async findOne(id: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: { 
        pedidos: true,
        convenios: { include: { empresa: true } } 
      }
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