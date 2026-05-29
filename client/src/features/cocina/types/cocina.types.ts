import type { EstadoPedido, TipoPedido } from '@/types';

export interface PedidoCocina {
  id: number;
  estado: EstadoPedido;
  tipo: TipoPedido;
  fecha: string;
  mesa?: { numero: string } | null;
  usuario: { nombre: string };
  detalles: DetalleCocina[];
}

export interface DetalleCocina {
  id: number;
  cantidad: number;
  notas?: string | null;
  producto: { nombre: string; precio: string };
  hijos: DetalleCocina[];
}

export const ESTADOS_COCINA: EstadoPedido[] = ['PENDIENTE', 'EN_PROCESO', 'LISTO'];

export const SIGUIENTE_ESTADO: Record<string, EstadoPedido> = {
  PENDIENTE: 'EN_PROCESO',
  EN_PROCESO: 'LISTO',
  LISTO: 'SERVIDO',
};

export const ESTADO_CONFIG = {
  PENDIENTE: {
    label: 'Pendiente',
    color: 'border-amber-400 bg-amber-50',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-400',
    boton: 'bg-amber-500 hover:bg-amber-600 text-white',
    accion: 'Iniciar preparación',
  },
  EN_PROCESO: {
    label: 'En Proceso',
    color: 'border-blue-400 bg-blue-50',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500 animate-pulse',
    boton: 'bg-blue-500 hover:bg-blue-600 text-white',
    accion: 'Marcar como listo',
  },
  LISTO: {
    label: 'Listo',
    color: 'border-emerald-400 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
    boton: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    accion: 'Marcar como servido',
  },
} as const;
