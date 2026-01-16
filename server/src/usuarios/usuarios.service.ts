import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';
import { Usuario } from '@prisma/client';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  private excludePassword(usuario: Usuario): Omit<Usuario, 'password'> {
    const { password, ...rest } = usuario;
    return rest;
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    try {
      const { password, ...userData } = createUsuarioDto;
      const hashedPassword = await bcrypt.hash(password, 10);

      const usuario = await this.prisma.usuario.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });

      return this.excludePassword(usuario);

    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('El email ya está registrado en el sistema');
      }
      throw new InternalServerErrorException('Error inesperado al crear usuario');
    }
  }

  async findAll() {
    const usuarios = await this.prisma.usuario.findMany({
      orderBy: { id: 'asc' },
    });
    return usuarios.map(u => this.excludePassword(u));
  }

  async findOne(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${id} no existe`);
    }

    return this.excludePassword(usuario);
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    await this.findOne(id); 

    const { password, ...restData } = updateUsuarioDto;
    let dataToUpdate: any = { ...restData };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    try {
      const usuarioActualizado = await this.prisma.usuario.update({
        where: { id },
        data: dataToUpdate,
      });
      return this.excludePassword(usuarioActualizado);

    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('El nuevo email ya está en uso por otro usuario');
      }
      throw new InternalServerErrorException('Error al actualizar usuario');
    }
  }

  async remove(id: number) {
    await this.findOne(id);

    const usuarioDesactivado = await this.prisma.usuario.update({
      where: { id },
      data: { activo: false },
    });

    return this.excludePassword(usuarioDesactivado);
  }
  
  async restore(id: number) {
     await this.prisma.usuario.update({
      where: { id },
      data: { activo: true },
    });
    return { message: `Usuario ${id} reactivado correctamente` };
  }

  async findOneByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }
}