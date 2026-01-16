import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Espera el token en Headers: Authorization Bearer ...
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRETO_SUPER_SEGURO', // Debe coincidir con auth.module
    });
  }

  // Esto añade los datos del usuario a la 'request' si el token es válido
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, rol: payload.rol };
  }
}