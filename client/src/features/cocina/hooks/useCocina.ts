import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cocinaService } from '../services/cocina.service';
import type { EstadoPedido } from '@/types';

export const usePedidosCocina = () =>
  useQuery({
    queryKey: ['pedidos-cocina'],
    queryFn: cocinaService.getPedidos,
    refetchInterval: 10_000, // refresca cada 10s
  });

export const useCambiarEstado = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cocinaService.cambiarEstado(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedidos-cocina'] });
      qc.invalidateQueries({ queryKey: ['mesas'] });
    },
  });
};
