import api from '@/api/axios';

export const crearMovimiento = async (payload: {
  productoId: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  motivo?: string;
}) => {
  const { data } = await api.post('/inventario', payload);
  return data;
};

export const obtenerKardex = async () => {
  const { data } = await api.get('/inventario');
  return data;
};