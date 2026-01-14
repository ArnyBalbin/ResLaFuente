import api from '@/api/axios';
import type { Mesa } from '@/types';

export const obtenerMesas = async (): Promise<Mesa[]> => {
  const { data } = await api.get('/mesas');
  return data;
};