import api from '@/api/axios';

export const obtenerUsuarios = async () => {
  const { data } = await api.get('/usuarios');
  return data;
};

export const crearUsuario = async (usuario: any) => {
  const { data } = await api.post('/usuarios', usuario);
  return data;
};

export const actualizarUsuario = async (id: number, usuario: any) => {
  const { data } = await api.patch(`/usuarios/${id}`, usuario);
  return data;
};

export const eliminarUsuario = async (id: number) => {
  const { data } = await api.delete(`/usuarios/${id}`);
  return data;
};