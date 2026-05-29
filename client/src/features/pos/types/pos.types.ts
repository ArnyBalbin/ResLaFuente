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

export interface ClienteSimple {
  id: number;
  nombre: string;
  dni?: string | null;
  telefono?: string | null;
  empresaId?: number | null;
  empresa?: EmpresaSimple | null;
}

export interface EmpresaSimple {
  id: number;
  razonSocial: string;
  ruc: string;
  tieneCredito: boolean;
  limiteCredito: string;
  creditoUsado: string;
}

export interface DetallePedidoPayload {
  productoId: number;
  cantidad: number;
  notas?: string;
  componentes?: DetallePedidoPayload[];
}

export interface CrearPedidoPayload {
  mesaId?: number;
  tipo: TipoPedido;
  direccion?: string;
  esCredito: boolean;
  usuarioId: number;
  clienteId?: number;
  empresaId?: number;
  items: DetallePedidoPayload[];
}

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precio: number;
  cantidad: number;
  notas?: string;
  imagenUrl?: string | null;
}

export const COSTO_LLEVAR = 2; // soles por plato
