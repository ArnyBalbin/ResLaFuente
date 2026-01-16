import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async login(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    // 1. Buscar usuario
    const usuario = await this.usuariosService.findOneByEmail(email);
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException(
        'Credenciales inválidas o usuario inactivo',
      );
    }

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas (Password)');
    }

    // 3. Generar Payload del Token (Información que viaja encriptada)
    const payload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };

    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: {
        // Devolvemos datos básicos para el frontend
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}
