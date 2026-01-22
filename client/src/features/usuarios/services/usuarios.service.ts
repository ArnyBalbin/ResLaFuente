import api from '@/api/axios';
import type { Usuario } from '@/types';

export interface CreateUsuarioDto extends Omit<Usuario, 'id'> {
  password?: string;
}

export const usuariosService = {
  getAll: async () => {
    const { data } = await api.get<Usuario[]>('/usuarios');
    return data;
  },

  create: async (data: CreateUsuarioDto) => {
    const { data: newUser } = await api.post<Usuario>('/usuarios', data);
    return newUser;
  },

  update: async (id: number, data: Partial<CreateUsuarioDto>) => {
    const { data: updatedUser } = await api.patch<Usuario>(`/usuarios/${id}`, data);
    return updatedUser;
  },

  delete: async (id: number) => {
    await api.delete(`/usuarios/${id}`);
  },

  restore: async (id: number) => {
    const { data } = await api.patch<{ message: string }>(
      `/usuarios/${id}/restore`
    );
    return data;
  },
};