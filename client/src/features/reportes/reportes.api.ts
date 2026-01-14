import api from '@/api/axios';

export const obtenerDashboardData = async () => {
  const { data } = await api.get('/reportes/dashboard');
  return data;
};