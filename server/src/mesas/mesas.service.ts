import { 
  Injectable, 
  ConflictException, 
  NotFoundException, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';

@Injectable()
export class MesasService {
  constructor(private prisma: PrismaService) {}

  async create(createMesaDto: CreateMesaDto) {
    try {
      return await this.prisma.mesa.create({
        data: createMesaDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`La mesa ${createMesaDto.numero} ya existe`);
      }
      throw new InternalServerErrorException('Error al crear la mesa');
    }
  }

  async findAll() {
    return this.prisma.mesa.findMany({
      orderBy: { numero: 'asc' },
    });
  }

  async findOne(id: number) {
    const mesa = await this.prisma.mesa.findUnique({
      where: { id },
    });
    if (!mesa) throw new NotFoundException(`Mesa #${id} no encontrada`);
    return mesa;
  }

  async update(id: number, updateMesaDto: UpdateMesaDto) {
    await this.findOne(id);
    try {
      return await this.prisma.mesa.update({
        where: { id },
        data: updateMesaDto,
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(`Ya existe otra mesa con el número ${updateMesaDto.numero}`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.mesa.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2003') {
        throw new BadRequestException('No se puede eliminar la mesa porque tiene pedidos registrados. Desactívela o cambie el nombre.');
      }
      throw error;
    }
  }

  async liberarMesaManual(id: number) {
    await this.findOne(id);
    return this.prisma.mesa.update({
      where: { id },
      data: { ocupada: false },
    });
  }
}