import type { TipoPedido, EstadoPedido } from '@/types';

export interface Mesa {
  id: number;
  numero: string;
  capacidad: number;
  ocupada: boolean;
  pedidoActivo?: PedidoResumen | null;
}

export interface PedidoResumen {
  id: number;
  estado: EstadoPedido;
  total: number;
  fecha: string;
  _count?: { detalles: number };
}

export interface DetallePedidoPayload {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  notas?: string;
}

export interface CrearPedidoPayload {
  mesaId?: number;
  tipo: TipoPedido;
  direccion?: string;
  detalles: DetallePedidoPayload[];
}

export interface DetallePedido {
  id: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  notas?: string;
  producto: {
    id: number;
    nombre: string;
    imagenUrl?: string | null;
  };
}

export interface Pedido {
  id: number;
  tipo: TipoPedido;
  estado: EstadoPedido;
  total: number;
  fecha: string;
  mesaId?: number | null;
  direccion?: string | null;
  detalles: DetallePedido[];
}

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  notas?: string;
  imagenUrl?: string | null;
}

export type VistaPos = 'mesas' | 'carrito';
