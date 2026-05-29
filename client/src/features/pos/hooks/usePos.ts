import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mesasService, catalogoService, pedidosService, clientesService, empresasService } from '../services/pos.service';
import type { CrearPedidoPayload } from '../types/pos.types';

export const useMesas = () =>
  useQuery({
    queryKey: ['mesas'],
    queryFn: mesasService.getAll,
    refetchInterval: 15_000,
  });

export const useCategorias = () =>
  useQuery({
    queryKey: ['categorias-pos'],
    queryFn: catalogoService.getCategorias,
    staleTime: 5 * 60_000,
  });

export const useProductosPorCategoria = () =>
  useQuery({
    queryKey: ['productos-pos'],
    queryFn: catalogoService.getProductos,
    staleTime: 2 * 60_000,
  });

export const useClientes = () =>
  useQuery({
    queryKey: ['clientes-pos'],
    queryFn: clientesService.getAll,
    staleTime: 5 * 60_000,
  });

export const useEmpresas = () =>
  useQuery({
    queryKey: ['empresas-pos'],
    queryFn: empresasService.getAll,
    staleTime: 5 * 60_000,
  });

export const useCrearPedido = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearPedidoPayload) => pedidosService.crear(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mesas'] });
    },
  });
};
