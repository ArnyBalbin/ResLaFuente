import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mesasService, catalogoService, pedidosService } from '../services/pos.service';
import type { CrearPedidoPayload } from '../types/pos.types';

// ── MESAS ──────────────────────────────────────────────────────────────────
export const useMesas = () =>
  useQuery({
    queryKey: ['mesas'],
    queryFn: mesasService.getAll,
    refetchInterval: 15_000, // refresca cada 15s automáticamente
  });

// ── CATÁLOGO ───────────────────────────────────────────────────────────────
export const useCategorias = () =>
  useQuery({
    queryKey: ['categorias-pos'],
    queryFn: catalogoService.getCategorias,
    staleTime: 5 * 60_000,
  });

export const useProductosPorCategoria = (categoriaId?: number) =>
  useQuery({
    queryKey: ['productos-pos', categoriaId],
    queryFn: () => catalogoService.getProductos(categoriaId),
    enabled: true,
  });

// ── PEDIDOS ────────────────────────────────────────────────────────────────
export const useCrearPedido = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearPedidoPayload) => pedidosService.crear(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mesas'] });
    },
  });
};
