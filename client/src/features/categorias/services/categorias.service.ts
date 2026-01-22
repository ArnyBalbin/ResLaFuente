import api from '@/api/axios';
import type { Categoria } from '@/types';

export interface CreateCategoriaDto {
  nombre: string;
  padreId?: number;
}

export const categoriasService = {
  getAll: async () => {
    const { data } = await api.get<Categoria[]>('/categorias');
    return data;
  },

  create: async (data: CreateCategoriaDto) => {
    const { data: newCat } = await api.post<Categoria>('/categorias', data);
    return newCat;
  },

  update: async (id: number, data: Partial<CreateCategoriaDto>) => {
    const { data: updatedCat } = await api.patch<Categoria>(`/categorias/${id}`, data);
    return updatedCat;
  },

  delete: async (id: number) => {
    await api.delete(`/categorias/${id}`);
  },
};