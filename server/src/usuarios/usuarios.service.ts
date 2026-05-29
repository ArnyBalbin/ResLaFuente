import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dtos/create-usuario.dto';
import { UpdateUsuarioDto } from './dtos/update-usuario.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);
  private readonly SALT_ROUNDS = 10;

  private readonly selectPublico: Prisma.UsuarioSelect = {
    id: true,
    sucursalId: true,
    nombre: true,
    email: true,
    telefono: true,
    rol: true,
    activo: true,
    creadoEn: true,
  };

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto, sucursalId: string) {
    this.logger.log(`Creando usuario ${dto.email} para la sucursal ${sucursalId}`);

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    return this.prisma.extended.usuario.create({
      data: {
        ...dto,
        password: hashedPassword,
        sucursalId, 
      },
      select: this.selectPublico,
    });
  }

  async findAll(sucursalId: string) {
    // El tenant isolation garantiza que solo veas empleados de TU local
    return this.prisma.extended.usuario.findMany({
      where: { sucursalId },
      select: this.selectPublico,
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string, sucursalId: string) {
    const usuario = await this.prisma.extended.usuario.findFirst({
      where: { id, sucursalId }, // Tenant isolation
      select: this.selectPublico,
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario no encontrado en esta sucursal`);
    }

    return usuario;
  }

  async update(id: string, dto: UpdateUsuarioDto, sucursalId: string) {
    await this.findOne(id, sucursalId); // Validar existencia y pertenencia

    const updateData: any = { ...dto };

    // Si envían una nueva contraseña, la hasheamos antes de guardarla
    if (dto.password) {
      updateData.password = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
    }

    return this.prisma.extended.usuario.update({
      where: { id },
      data: updateData,
      select: this.selectPublico,
    });
  }

  async remove(id: string, sucursalId: string) {
    this.logger.log(`Soft delete de usuario ID: ${id} en sucursal ${sucursalId}`);
    await this.findOne(id, sucursalId);

    // El PrismaClientExceptionFilter y el softDeleteExtension 
    // interceptarán este delete y lo volverán un update(eliminadoEn: new Date())
    await this.prisma.extended.usuario.delete({
      where: { id },
    });

    return { message: 'Usuario eliminado correctamente' };
  }
}