import { create } from 'zustand';
import type { ItemComanda, Producto } from '@/types';

interface ComandaState {
  mesaId: number | null;
  items: ItemComanda[];
  
  seleccionarMesa: (id: number) => void;
  agregarProducto: (producto: Producto, cantidad: number, notas?: string) => void;
  eliminarProducto: (productoId: number) => void;
  limpiarComanda: () => void;
  
  total: () => number;
}

export const useComandaStore = create<ComandaState>((set, get) => ({
  mesaId: null,
  items: [],

  seleccionarMesa: (id) => set({ mesaId: id }),

  agregarProducto: (producto, cantidad, notas) => {
    const itemsActuales = get().items;

    const existe = itemsActuales.find((i) => i.producto.id === producto.id);

    if (existe) {
      set({
        items: itemsActuales.map((i) =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        ),
      });
    } else {
      set({
        items: [...itemsActuales, { producto, cantidad, notas }],
      });
    }
  },

  eliminarProducto: (productoId) => {
    set({
      items: get().items.filter((i) => i.producto.id !== productoId),
    });
  },

  limpiarComanda: () => set({ mesaId: null, items: [] }),

  total: () => {
    return get().items.reduce((suma, item) => {
      return suma + (Number(item.producto.precio) * item.cantidad);
    }, 0);
  },
}));