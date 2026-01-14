import api from '@/api/axios';

// 1. Consultar caja (Usamos la ruta específica por usuario)
export const obtenerCajaActual = async (usuarioId: number) => {
  // Ahora llamamos a la ruta CORRECTA del backend: /caja/abierta/1
  const { data } = await api.get(`/caja/abierta/${usuarioId}`);
  return data; // Si el backend devuelve null, data será null o vacío
};

// 2. Abrir caja (Ruta /caja/abrir)
export const abrirCaja = async (usuarioId: number, montoInicial: number) => {
  const { data } = await api.post('/caja/abrir', {
    usuarioId,
    montoInicial: Number(montoInicial)
  });
  return data;
};

// 3. Cerrar caja (Ruta /caja/cerrar/:id)
export const cerrarCaja = async (cajaId: number, montoFinal: number) => {
  const { data } = await api.patch(`/caja/cerrar/${cajaId}`, {
    montoFinal: Number(montoFinal),
    observaciones: 'Cierre de turno' // Opcional
  });
  return data;
};