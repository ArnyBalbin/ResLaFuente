export interface Categoria {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl?: string;
  categoriaId: number;
  esProductoFinal: boolean;
  stock?: number;
  disponibleHoy: boolean;
  categoria?: Categoria;
}

export interface ItemComanda {
  producto: Producto;
  cantidad: number;
  notas?: string;
}

export interface CrearPedidoPayload {
  mesaId?: number;
  usuarioId: number;
  clienteId?: number;
  detalles: {
    productoId: number;
    cantidad: number;
    notas?: string;
  }[];

  tipo: 'MESA' | 'LLEVAR' | 'DELIVERY';
  direccion?: string;
  esCredito?: boolean;
  empresaId?: number;
}

export interface Mesa {
  id: number;
  numero: string;
  capacidad: number;
  ocupada: boolean;
}

export interface DetallePedido {
  id: number;
  cantidad: number;
  notas?: string;
  producto: Producto;
}

export interface Pedido {
  id: number;
  mesaId?: number;
  estado: string;
  fecha: string;
  mesa?: Mesa;
  usuario: { nombre: string };
  detalles: DetallePedido[];
}