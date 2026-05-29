import { 
  IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, 
  IsString, IsUUID, MaxLength, Min 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoArticulo, AreaDespacho } from '@prisma/client';

export class CreateProductoDto {
  @ApiProperty({ example: 'Lomo Saltado', description: 'Nombre comercial del producto' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @ApiProperty({ enum: TipoArticulo, default: TipoArticulo.PLATO, description: 'Diferencia platos preparados de productos directos' })
  @IsEnum(TipoArticulo)
  @IsNotEmpty()
  tipo!: TipoArticulo;

  @ApiProperty({ example: 25.50, description: 'Precio de venta al público' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  precio!: number;

  @ApiProperty({ enum: AreaDespacho, default: AreaDespacho.COCINA, description: 'Define a qué KDS o impresora se envía el pedido' })
  @IsEnum(AreaDespacho)
  @IsNotEmpty()
  areaDespacho!: AreaDespacho;

  @ApiProperty({ example: '550e8400-e29b...', description: 'ID de la categoría a la que pertenece' })
  @IsUUID('4')
  @IsNotEmpty()
  categoriaId!: string;

  @ApiPropertyOptional({ example: false, description: 'Activar si requiere control de inventario directo (ej. Gaseosas)' })
  @IsBoolean()
  @IsOptional()
  controlarStock?: boolean;

  @ApiPropertyOptional({ example: 0, description: 'Costo de adquisición o producción' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  costo?: number;

  @ApiPropertyOptional({ example: 0, description: 'Stock físico actual (si controlarStock es true)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 5, description: 'Umbral para disparar alertas visuales de escasez' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockMinimo?: number;

  @ApiPropertyOptional({ example: true, description: 'Permite ocultar el producto del menú sin borrarlo' })
  @IsBoolean()
  @IsOptional()
  disponibleHoy?: boolean;

  @ApiPropertyOptional({ description: 'URL de la foto del producto para catálogos digitales' })
  @IsString()
  @IsOptional()
  imagenUrl?: string;
}