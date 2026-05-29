import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dtos/create-menu.dto';
import { UpdateMenuDto } from './dtos/update-menu.dto';

@Injectable()
export class MenuService {
  private readonly logger = new Logger(MenuService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMenuDto, sucursalId: string) {
    // 1. Validar que el plato principal exista y pertenezca a la sucursal actual
    await this.validarProductos([dto.segundoId], sucursalId, 'plato principal');

    // 2. Validar que todas las entradas existan y pertenezcan a la sucursal
    if (dto.entradas && dto.entradas.length > 0) {
      await this.validarProductos(dto.entradas, sucursalId, 'entrada');
    }

    // 3. Crear el menú y sus entradas usando Transacciones para evitar inconsistencias
    return this.prisma.extended.$transaction(async (tx) => {
      const menu = await tx.menuDia.create({
        data: {
          nombre: dto.nombre,
          precio: dto.precio,
          segundoId: dto.segundoId,
        },
      });

      if (dto.entradas && dto.entradas.length > 0) {
        const entradasData = dto.entradas.map(productoId => ({
          menuId: menu.id,
          productoId,
        }));
        await tx.menuEntrada.createMany({ data: entradasData });
      }

      return menu;
    });
  }

  async findAll(sucursalId: string, soloActivos: boolean = false) {
    // Aislamiento de Tenant a través de la relación con el Producto (Segundo)
    return this.prisma.extended.menuDia.findMany({
      where: {
        segundo: { sucursalId },
        ...(soloActivos ? { activo: true } : {}),
      },
      include: {
        segundo: { select: { nombre: true, imagenUrl: true } },
        entradas: {
          include: {
            producto: { select: { nombre: true, disponibleHoy: true } },
          },
        },
      },
      orderBy: { creadoEn: 'desc' },
    });
  }

  async findOne(id: string, sucursalId: string) {
    const menu = await this.prisma.extended.menuDia.findFirst({
      where: { 
        id, 
        segundo: { sucursalId } // Tenant Isolation
      },
      include: {
        segundo: true,
        entradas: { include: { producto: true } },
      },
    });

    if (!menu) {
      throw new NotFoundException(`El menú no existe en esta sucursal`);
    }

    return menu;
  }

  async update(id: string, dto: UpdateMenuDto, sucursalId: string) {
    await this.findOne(id, sucursalId); // Validar propiedad

    if (dto.segundoId) {
      await this.validarProductos([dto.segundoId], sucursalId, 'plato principal');
    }

    return this.prisma.extended.$transaction(async (tx) => {
      // Si se envían nuevas entradas, borramos las viejas y recreamos (Sincronización limpia)
      if (dto.entradas) {
        await this.validarProductos(dto.entradas, sucursalId, 'entrada');
        
        await tx.menuEntrada.deleteMany({ where: { menuId: id } });
        
        if (dto.entradas.length > 0) {
          const entradasData = dto.entradas.map(productoId => ({
            menuId: id,
            productoId,
          }));
          await tx.menuEntrada.createMany({ data: entradasData });
        }
      }

      // Extraemos campos directos del menú
      const { entradas, ...menuData } = dto;

      return tx.menuDia.update({
        where: { id },
        data: menuData,
        include: { entradas: { include: { producto: true } } },
      });
    });
  }

  async remove(id: string, sucursalId: string) {
    this.logger.log(`Desactivando menú ID: ${id}`);
    await this.findOne(id, sucursalId);

    // Como el modelo MenuDia no tiene eliminadoEn, usamos un Soft Disable (activo: false)
    await this.prisma.extended.menuDia.update({
      where: { id },
      data: { activo: false },
    });

    return { message: 'Menú desactivado exitosamente. Ya no aparecerá en las tablets.' };
  }

  // --- Helpers de Validación ---
  private async validarProductos(productoIds: string[], sucursalId: string, tipo: string) {
    const productos = await this.prisma.extended.producto.findMany({
      where: { 
        id: { in: productoIds },
        sucursalId 
      },
    });

    if (productos.length !== productoIds.length) {
      throw new ConflictException(`Uno o más productos enviados como '${tipo}' no existen o pertenecen a otra sucursal.`);
    }
  }
}