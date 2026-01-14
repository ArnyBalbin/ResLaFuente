import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const existe = await this.prisma.usuario.findUnique({
      where: { email: createUsuarioDto.email }
    });

    if (existe) {
      throw new BadRequestException('El email ya está registrado');
    }

    return this.prisma.usuario.create({
      data: createUsuarioDto,
    });
  }

  findAll() {
    return this.prisma.usuario.findMany();
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
    });
  }

  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
    });
  }

  async remove(id: number) {
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false }
    });
  }

  async login(email: string, pass: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email }
    });

    if (usuario && usuario.password === pass && usuario.activo) {
      const { password, ...result } = usuario;
      return result;
    }

    return null;
  }
}