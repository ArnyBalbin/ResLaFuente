import api from '@/api/axios';
import type { Mesa, CrearPedidoPayload, Pedido } from '../types/pos.types';
import type { Categoria, Producto } from '@/types';

// ── MESAS ──────────────────────────────────────────────────────────────────
export const mesasService = {
  getAll: async (): Promise<Mesa[]> => {
    const { data } = await api.get('/mesas');
    return data;
  },
};

// ── PRODUCTOS / CATEGORÍAS ─────────────────────────────────────────────────
export const catalogoService = {
  getCategorias: async (): Promise<Categoria[]> => {
    const { data } = await api.get('/categorias');
    return data;
  },

  getProductos: async (categoriaId?: number): Promise<Producto[]> => {
    const params = categoriaId ? { categoriaId } : {};
    const { data } = await api.get('/productos', { params });
    return data;
  },
};

// ── PEDIDOS ────────────────────────────────────────────────────────────────
export const pedidosService = {
  crear: async (payload: CrearPedidoPayload): Promise<Pedido> => {
    const { data } = await api.post('/pedidos', payload);
    return data;
  },

  getById: async (id: number): Promise<Pedido> => {
    const { data } = await api.get(`/pedidos/${id}`);
    return data;
  },

  agregarItems: async (pedidoId: number, detalles: CrearPedidoPayload['detalles']): Promise<Pedido> => {
    const { data } = await api.post(`/pedidos/${pedidoId}/items`, { detalles });
    return data;
  },

  cerrar: async (pedidoId: number, metodoPago: string, cajaId: number): Promise<void> => {
    await api.post(`/pedidos/${pedidoId}/cerrar`, { metodoPago, cajaId });
  },
};

// ── CAJA ───────────────────────────────────────────────────────────────────
export const cajaService = {
  getCajaActiva: async (): Promise<{ id: number } | null> => {
    try {
      const { data } = await api.get('/caja/activa');
      return data;
    } catch {
      return null;
    }
  },
};
