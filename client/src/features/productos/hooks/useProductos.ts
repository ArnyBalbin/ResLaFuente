import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productosService } from '../services/productos.service';
import { toast } from 'sonner';

export const useProductos = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['productos'],
    queryFn: productosService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: ({ data, file }: { data: any; file?: File }) => 
      productosService.create(data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto creado correctamente');
    },
    onError: () => toast.error('Error al crear producto'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, file }: { id: number; data: any; file?: File }) => 
      productosService.update(id, data, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const toggleMutation = useMutation({
    mutationFn: productosService.toggleDisponibilidad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: () => toast.error('Error al cambiar disponibilidad'),
  });

  const deleteMutation = useMutation({
    mutationFn: productosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto eliminado');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al eliminar';
      toast.error(msg);
    },
  });

  return {
    productos: query.data || [],
    isLoading: query.isLoading,
    crearProducto: createMutation.mutateAsync,
    actualizarProducto: updateMutation.mutateAsync,
    toggleProducto: toggleMutation.mutateAsync,
    eliminarProducto: deleteMutation.mutateAsync,
  };
};