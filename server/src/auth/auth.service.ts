import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginAdminDto } from './dtos/login-admin.dto';
import { LoginPosDto } from './dtos/login-pos.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginAdmin(dto: LoginAdminDto) {
    // 1. Buscar usuario por email (asegurando que esté activo y no eliminado)
    const usuario = await this.prisma.extended.usuario.findFirst({
      where: { email: dto.email, activo: true },
    });

    if (!usuario) {
      this.logger.warn(`Intento de login fallido: Email no encontrado (${dto.email})`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 2. Validar contraseña
    const passwordValida = await bcrypt.compare(dto.password, usuario.password);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Generar JWT
    return this.generarToken(usuario);
  }

  async loginPos(dto: LoginPosDto) {
    // 1. Buscar usuario por PIN estrictamente dentro de la sucursal de la tablet
    const usuario = await this.prisma.extended.usuario.findFirst({
      where: { 
        pinAcceso: dto.pinAcceso, 
        sucursalId: dto.sucursalId,
        activo: true 
      },
    });

    if (!usuario) {
      this.logger.warn(`Intento de login POS fallido en sucursal: ${dto.sucursalId}`);
      throw new UnauthorizedException('PIN incorrecto o usuario inactivo');
    }

    // 2. Generar JWT para el dispositivo POS
    return this.generarToken(usuario);
  }

  private generarToken(usuario: any) {
    const payload: JwtPayload = {
      sub: usuario.id,
      sucursalId: usuario.sucursalId,
      rol: usuario.rol,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        sucursalId: usuario.sucursalId,
      }
    };
  }
}