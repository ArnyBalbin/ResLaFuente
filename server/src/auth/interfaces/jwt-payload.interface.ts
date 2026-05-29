import { Rol } from '@prisma/client';

export interface JwtPayload {
  sub: string;        // ID del Usuario
  sucursalId: string; // Tenant ID
  rol: Rol;           // Para validación de permisos
}