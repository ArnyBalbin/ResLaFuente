import api from '@/api/axios';
import type { Producto, Categoria } from '@/types';

// Traer todos los productos (incluye su categoría dentro)
export const obtenerProductos = async (): Promise<Producto[]> => {
  const { data } = await api.get('/productos'); 
  return data;
};

export const crearProducto = async (producto: any) => {
  const { data } = await api.post('/productos', producto);
  return data;
};

export const actualizarProducto = async (id: number, producto: any) => {
  const { data } = await api.patch(`/productos/${id}`, producto);
  return data;
}

export const eliminarProducto = async (id: number) => {
  const { data } = await api.delete(`/productos/${id}`);
  return data;
}

export const obtenerCategorias = async (): Promise<Categoria[]> => {
  const { data } = await api.get('/categorias'); 
  return data;
};