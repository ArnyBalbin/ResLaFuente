import api from '@/api/axios';
import type { Mesa, CrearPedidoPayload, ClienteSimple, EmpresaSimple } from '../types/pos.types';
import type { Categoria, Producto } from '@/types';

export const mesasService = {
  getAll: async (): Promise<Mesa[]> => {
    const { data } = await api.get('/mesas');
    return data;
  },
};

export const catalogoService = {
  getCategorias: async (): Promise<Categoria[]> => {
    const { data } = await api.get('/categorias');
    return data;
  },
  getProductos: async (): Promise<Producto[]> => {
    const { data } = await api.get('/productos');
    return data;
  },
};

export const clientesService = {
  getAll: async (): Promise<ClienteSimple[]> => {
    const { data } = await api.get('/clientes');
    return data;
  },
};

export const empresasService = {
  getAll: async (): Promise<EmpresaSimple[]> => {
    const { data } = await api.get('/empresas');
    return data;
  },
};

export const pedidosService = {
  crear: async (payload: CrearPedidoPayload) => {
    const { data } = await api.post('/pedidos', payload);
    return data;
  },
};
