import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriasService, type CreateCategoriaDto } from '../services/categorias.service';
import { toast } from 'sonner';

export const useCategorias = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriasService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: categoriasService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría creada');
    },
    onError: () => toast.error('Error al crear categoría'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateCategoriaDto> }) =>
      categoriasService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría actualizada');
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriasService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría eliminada');
    },
    onError: (error: any) => {
      // Manejamos el error específico del backend ("tiene productos asociados")
      const msg = error.response?.data?.message || 'Error al eliminar';
      toast.error(msg);
    },
  });

  return {
    categorias: query.data || [],
    isLoading: query.isLoading,
    crearCategoria: createMutation.mutateAsync,
    actualizarCategoria: updateMutation.mutateAsync,
    eliminarCategoria: deleteMutation.mutateAsync,
  };
};