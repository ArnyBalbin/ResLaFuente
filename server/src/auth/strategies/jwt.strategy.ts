import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKeySuperSegura123!', 
    });
  }

  async validate(payload: JwtPayload) {
    return { 
      sub: payload.sub, 
      sucursalId: payload.sucursalId, 
      rol: payload.rol 
    };
  }
}