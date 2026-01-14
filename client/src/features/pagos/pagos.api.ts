import api from '@/api/axios';

export const obtenerPedidoActivo = async (mesaId: number) => {
  const { data } = await api.get('/pedidos'); 
  const pedido = data.find((p: any) => p.mesaId === mesaId && p.estado !== 'CERRADO');
  return pedido;
};

export const realizarPago = async (payload: {
  pedidoId: number;
  cajaId: number;
  metodo: 'EFECTIVO' | 'YAPE_PLIN' | 'TARJETA';
  monto: number;
  codigoOperacion?: string;
}) => {
  const { data } = await api.post('/pagos', payload);
  return data;
};

export const abrirCaja = async (usuarioId: number, monto: number) => {
  const { data } = await api.post('/caja/abrir', { usuarioId, montoInicial: monto });
  return data;
};