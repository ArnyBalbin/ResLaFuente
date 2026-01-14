import api from '@/api/axios';
import type { Pedido, CrearPedidoPayload } from '@/types';

export const crearPedido = async (payload: CrearPedidoPayload) => {
  const { data } = await api.post('/pedidos', payload);
  return data;
};

export const obtenerPedidosCocina = async (): Promise<any[]> => {
  const { data } = await api.get('/pedidos/cocina');
  return data;
};