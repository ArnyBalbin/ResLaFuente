import api from '@/api/axios';

export const obtenerClientes = async () => {
  const { data } = await api.get('/clientes');
  return data;
};

export const crearCliente = async (cliente: any) => {
  const { data } = await api.post('/clientes', cliente);
  return data;
}

export const actualizarCliente = async (id: number, cliente: any) => {
  const { data } = await api.patch(`/clientes/${id}`, cliente);
  return data;
}

export const eliminarCliente = async (id: number) => {
  const { data } = await api.delete(`/clientes/${id}`);
  return data;
}