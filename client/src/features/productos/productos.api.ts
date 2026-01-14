import api from '@/api/axios';
import type { Producto, Categoria } from '@/types';

// Traer todos los productos (incluye su categoría dentro)
export const obtenerProductos = async (): Promise<Producto[]> => {
  const { data } = await api.get('/productos'); 
  return data;
};

// Traer solo las categorías (para las pestañas)
// Nota: Si no creaste un endpoint especifico de categorias en el backend, 
// no te preocupes, usaremos un truco en el frontend para extraerlas de los productos.
export const obtenerCategorias = async (): Promise<Categoria[]> => {
  const { data } = await api.get('/categorias'); 
  return data;
};