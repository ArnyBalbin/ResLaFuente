import api from '@/api/axios';
import type { Cliente, PedidoCliente, CrearClienteDto } from '../types/clientes.types';

export const clientesService = {
  getAll: async (): Promise<Cliente[]> => {
    const { data } = await api.get('/clientes');
    return data;
  },

  getOne: async (id: number): Promise<Cliente> => {
    const { data } = await api.get(`/clientes/${id}`);
    return data;
  },

  getPedidos: async (clienteId: number): Promise<PedidoCliente[]> => {
    const { data } = await api.get('/pedidos', { params: { clienteId } });
    return data;
  },

  crear: async (dto: CrearClienteDto): Promise<Cliente> => {
    const { data } = await api.post('/clientes', dto);
    return data;
  },

  actualizar: async (id: number, dto: Partial<CrearClienteDto>): Promise<Cliente> => {
    const { data } = await api.patch(`/clientes/${id}`, dto);
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};
