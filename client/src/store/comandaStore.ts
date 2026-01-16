import { create } from 'zustand';
import type { ItemComanda, Producto } from '@/types';

interface ComandaState {
  mesaId: number | null;
  items: ItemComanda[];
  
  seleccionarMesa: (id: number) => void;
  // Agregamos notas opcional aquí
  agregarProducto: (producto: Producto, cantidad: number, notas?: string) => void;
  // Eliminar ahora pide ID y NOTAS para saber cuál borrar exactamente
  eliminarProducto: (productoId: number, notas?: string) => void; 
  limpiarComanda: () => void;
  
  total: () => number;
}

export const useComandaStore = create<ComandaState>((set, get) => ({
  mesaId: null,
  items: [],

  seleccionarMesa: (id) => set({ mesaId: id }),

  agregarProducto: (producto, cantidad, notas) => {
    const itemsActuales = get().items;
    
    // CORRECCIÓN CRÍTICA:
    // Buscamos si existe el producto con el MISMO ID y la MISMA NOTA.
    // Tratamos undefined como string vacío para evitar errores de comparación.
    const notaNormalizada = notas || '';

    const existeIndex = itemsActuales.findIndex((i) => 
      i.producto.id === producto.id && 
      (i.notas || '') === notaNormalizada
    );

    if (existeIndex >= 0) {
      // Si existe exacto, sumamos cantidad
      const nuevosItems = [...itemsActuales];
      nuevosItems[existeIndex].cantidad += cantidad;
      set({ items: nuevosItems });
    } else {
      // Si es nuevo (o tiene nota distinta), agregamos nueva línea
      set({
        items: [...itemsActuales, { producto, cantidad, notas: notaNormalizada }],
      });
    }
  },

  eliminarProducto: (productoId, notas) => {
    const notaNormalizada = notas || '';
    set({
      // Mantenemos el ítem si el ID es distinto O la nota es distinta
      items: get().items.filter((i) => 
        i.producto.id !== productoId || (i.notas || '') !== notaNormalizada
      ),
    });
  },

  limpiarComanda: () => set({ mesaId: null, items: [] }),

  total: () => {
    return get().items.reduce((suma, item) => {
      return suma + (Number(item.producto.precio) * item.cantidad);
    }, 0);
  },
}));