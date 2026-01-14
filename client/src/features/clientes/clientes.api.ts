import api from '@/api/axios';

export const obtenerClientes = async () => {
  const { data } = await api.get('/clientes');
  return data;
};

export const crearCliente = async (cliente: any) => {
  const { data } = await api.post('/clientes', cliente);
  return data;
}

export const actualizarCliente = (id: number, data: any) => {
  if (data.tipoEntidad === 'EMPRESA') {
    return api.patch(`/empresas/${id}`, data);
  }
  return api.patch(`/clientes/${id}`, data);
};

export const eliminarCliente = async (id: number, tipoEntidad: string) => {
  const { data } = await api.delete(`/clientes/${id}?tipo=${tipoEntidad}`);
  return data;
};