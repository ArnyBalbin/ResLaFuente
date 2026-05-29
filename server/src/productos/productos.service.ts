import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { BadRequestException } from '@nestjs/common';
import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto } from './dtos/create-producto.dto';
import { UpdateProductoDto } from './dtos/update-producto.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductoService {
  private readonly logger = new Logger(ProductoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService, // <--- Inyectar servicio
  ) {}

  async create(dto: CreateProductoDto, sucursalId: string) {
    // 1. Validar que la categoría exista y pertenezca a la misma sucursal
    await this.validarCategoria(dto.categoriaId, sucursalId);

    // 2. Creación segura mapeando los campos
    return this.prisma.extended.producto.create({
      data: {
        ...dto,
        sucursalId,
      },
    });
  }

  async findAll(sucursalId: string, queryFilters?: { categoriaId?: string; disponibleHoy?: boolean }) {
    const where: Prisma.ProductoWhereInput = { sucursalId };

    if (queryFilters?.categoriaId) {
      where.categoriaId = queryFilters.categoriaId;
    }

    if (queryFilters?.disponibleHoy !== undefined) {
      where.disponibleHoy = queryFilters.disponibleHoy;
    }

    return this.prisma.extended.producto.findMany({
      where,
      include: {
        categoria: { select: { nombre: true } }
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string, sucursalId: string) {
    const producto = await this.prisma.extended.producto.findFirst({
      where: { id, sucursalId },
      include: {
        categoria: true,
      },
    });

    if (!producto) {
      throw new NotFoundException(`El producto no existe en el catálogo de esta sucursal`);
    }

    return producto;
  }

  async update(id: string, dto: UpdateProductoDto, sucursalId: string) {
    // Validar existencia
    await this.findOne(id, sucursalId);

    // Si intenta cambiar la categoría, validar la nueva
    if (dto.categoriaId) {
      await this.validarCategoria(dto.categoriaId, sucursalId);
    }

    return this.prisma.extended.producto.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, sucursalId: string) {
    this.logger.log(`Intentando eliminar producto ID: ${id}`);
    const producto = await this.findOne(id, sucursalId);

    // Regla Enterprise: No permitir el borrado si hay comandas históricas
    const count = await this.prisma.extended.producto.findFirst({
      where: { id },
      select: {
        _count: {
          select: { detallesPedido: true, movimientos: true }
        }
      }
    });

    const totalDetalles = count?._count?.detallesPedido ?? 0;
    const totalMovimientos = count?._count?.movimientos ?? 0;

    if (totalDetalles > 0 || totalMovimientos > 0) {
      throw new ConflictException(
        `El producto '${producto.nombre}' ya tiene un historial de ventas o movimientos de inventario. No se puede eliminar. Para ocultarlo, cambie 'disponibleHoy' a false.`
      );
    }

    // Se aplica el Soft Delete de la extensión Prisma
    await this.prisma.extended.producto.delete({
      where: { id },
    });

    return { message: 'Producto eliminado del catálogo' };
  }

  // --- Validación Auxiliar ---
  private async validarCategoria(categoriaId: string, sucursalId: string) {
    const categoria = await this.prisma.extended.categoria.findFirst({
      where: { id: categoriaId, sucursalId },
    });

    if (!categoria) {
      throw new ConflictException('La categoría asignada no es válida o pertenece a otra sucursal');
    }
  }

  async subirImagen(id: string, sucursalId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo de imagen.');
    }

    // 1. Validar que el producto exista y pertenezca a la sucursal actual
    await this.findOne(id, sucursalId);

    try {
      // 2. Subir imagen a Cloudinary usando tu servicio existente
      const uploadResult = await this.cloudinaryService.uploadImage(file);

      // 3. Actualizar la URL segura en la base de datos
      return await this.prisma.extended.producto.update({
        where: { id },
        data: { imagenUrl: uploadResult.secure_url },
      });
      
    } catch (error) {
      this.logger.error('Error al subir imagen a Cloudinary', error);
      throw new BadRequestException('Hubo un problema al procesar la imagen con Cloudinary.');
    }
  }
}