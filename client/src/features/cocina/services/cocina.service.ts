import api from '@/api/axios';
import type { PedidoCocina } from '../types/cocina.types';
import type { EstadoPedido } from '@/types';

export const cocinaService = {
  getPedidos: async (): Promise<PedidoCocina[]> => {
    const { data } = await api.get('/pedidos', {
      params: { estado: undefined }, // trae PENDIENTE, EN_PROCESO, LISTO
    });
    return data;
  },

  cambiarEstado: async (id: number, estado: EstadoPedido): Promise<void> => {
    await api.patch(`/pedidos/${id}/estado`, { estado });
  },
};
