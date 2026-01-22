export type Rol = 'ADMIN' | 'MOZO' | 'COCINA' | 'CAJA';
export type TipoProducto = 'CARTA' | 'MENU' | 'GUARNICION' | 'BEBIDA' | 'EXTRA';
export type TipoPedido = 'MESA' | 'LLEVAR' | 'DELIVERY';
export type EstadoPedido = 'PENDIENTE' | 'EN_PROCESO' | 'LISTO' | 'SERVIDO' | 'CERRADO' | 'CANCELADO';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  creadoEn: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  productos?: Producto[];
  hijos?: Categoria[]; 
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  controlarStock: boolean;
  stock: number;
  disponibleHoy: boolean;
  tipo: TipoProducto;
  categoriaId: number;
  imagenUrl?: string;
}

export interface ItemComanda {
  uniqueId: string;
  producto: Producto;
  cantidad: number;
  notas?: string;
  componentes?: ItemComanda[]; 
}