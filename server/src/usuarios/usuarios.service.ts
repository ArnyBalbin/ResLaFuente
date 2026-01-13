import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  // 1. CREAR USUARIO
  async create(createUsuarioDto: CreateUsuarioDto) {
    // Validar que el email no exista
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

  // 2. LISTAR TODOS
  findAll() {
    return this.prisma.usuario.findMany();
  }

  // 3. BUSCAR POR ID
  findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
    });
  }

  // 4. ACTUALIZAR
  update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    return this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
    });
  }

  // 5. ELIMINAR (Baja lógica: desactivar en vez de borrar)
  async remove(id: number) {
    // En sistemas reales no se borran usuarios para no romper historial de pedidos
    // Mejor lo desactivamos
    return this.prisma.usuario.update({
      where: { id },
      data: { activo: false }
    });
  }
}