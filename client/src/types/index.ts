export type Rol = 'ADMIN' | 'MOZO' | 'COCINA' | 'CAJA';
export type TipoPedido = 'MESA' | 'LLEVAR' | 'DELIVERY';
export type EstadoPedido = 'PENDIENTE' | 'EN_PROCESO' | 'LISTO' | 'SERVIDO' | 'CERRADO' | 'CANCELADO';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  rol: Rol;
  activo: boolean;
  creadoEn: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  padreId: number | null;
  hijos?: Categoria[];
  _count?: {
    productos: number;
  };
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  controlarStock: boolean;
  stock: number;
  disponibleHoy: boolean;
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