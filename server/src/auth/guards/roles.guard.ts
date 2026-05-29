import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true; // Si no hay decorador @Roles, la ruta es pública o solo requiere JWT
    }

    const { user } = context.switchToHttp().getRequest<{ user: JwtPayload }>();

    const hasRole = requiredRoles.includes(user.rol);
    if (!hasRole) {
      throw new ForbiddenException('No tienes permisos suficientes para realizar esta acción');
    }

    return true;
  }
}