import api from '@/api/axios';
import type { Producto } from '@/types';

export const productosService = {
  getAll: async () => {
    const { data } = await api.get<Producto[]>('/productos');
    return data;
  },

  create: async (data: any, file?: File) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key].toString());
      }
    });

    if (file) {
      formData.append('imagen', file);
    }

    const { data: newProd } = await api.post<Producto>('/productos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return newProd;
  },

  update: async (id: number, data: any, file?: File) => {
    if (file) {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key].toString());
        }
      });
      formData.append('imagen', file);
      
      const { data: updated } = await api.patch<Producto>(`/productos/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return updated;
    } 
    
    const { data: updated } = await api.patch<Producto>(`/productos/${id}`, data);
    return updated;
  },

  toggleDisponibilidad: async (id: number) => {
    const { data } = await api.patch<Producto>(`/productos/${id}/toggle`);
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/productos/${id}`);
  },
};