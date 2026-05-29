import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesService } from '../services/clientes.service';
import type { CrearClienteDto } from '../types/clientes.types';

export const useClientes = () =>
  useQuery({
    queryKey: ['clientes'],
    queryFn: clientesService.getAll,
  });

export const usePedidosCliente = (clienteId: number | null) =>
  useQuery({
    queryKey: ['pedidos-cliente', clienteId],
    queryFn: () => clientesService.getPedidos(clienteId!),
    enabled: !!clienteId,
  });

export const useCrearCliente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearClienteDto) => clientesService.crear(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
};

export const useActualizarCliente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CrearClienteDto> }) =>
      clientesService.actualizar(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
};

export const useEliminarCliente = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clientesService.eliminar(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
};
