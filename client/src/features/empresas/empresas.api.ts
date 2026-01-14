import api from '@/api/axios';

export const obtenerEmpresas = async () => {
  const { data } = await api.get('/empresas');
  return data;
};

export const crearEmpresa = async (empresa: any) => {
  const { data } = await api.post('/empresas', empresa);
  return data;
};

export const actualizarEmpresa = async (id: number, empresa: any) => {
  const { data } = await api.patch(`/empresas/${id}`, empresa);
  return data;
};

export const eliminarEmpresa = async (id: number) => {
  const { data } = await api.delete(`/empresas/${id}`);
  return data;
};