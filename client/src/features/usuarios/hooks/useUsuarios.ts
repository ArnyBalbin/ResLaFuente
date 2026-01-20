import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosService, type CreateUsuarioDto } from '../services/usuarios.service';
import { toast } from 'sonner';

export const useUsuarios = () => {
  const queryClient = useQueryClient();

  // 1. Obtener Usuarios (Query)
  const usuariosQuery = useQuery({
    queryKey: ['usuarios'],
    queryFn: usuariosService.getAll,
  });

  // 2. Crear Usuario (Mutation)
  const createMutation = useMutation({
    mutationFn: usuariosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] }); // Recarga la tabla
      toast.success('Usuario creado correctamente');
    },
    onError: () => toast.error('Error al crear usuario'),
  });

  // 3. Actualizar Usuario (Mutation)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateUsuarioDto> }) =>
      usuariosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });

  // 4. Eliminar Usuario (Mutation)
  const deleteMutation = useMutation({
    mutationFn: usuariosService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario eliminado');
    },
    onError: () => toast.error('Error al eliminar'),
  });

  return {
    usuarios: usuariosQuery.data || [],
    isLoading: usuariosQuery.isLoading,
    isError: usuariosQuery.isError,
    crearUsuario: createMutation.mutateAsync,
    actualizarUsuario: updateMutation.mutateAsync,
    eliminarUsuario: deleteMutation.mutateAsync,
  };
};