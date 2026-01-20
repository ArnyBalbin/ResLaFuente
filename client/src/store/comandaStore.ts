import { create } from 'zustand';
import type { ItemComanda, Producto, TipoPedido } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ComandaState {
  items: ItemComanda[];
  mesaId: number | null;
  tipoPedido: TipoPedido;
  clienteId: number | null;
  empresaId: number | null;
  esCredito: boolean;

  setMesa: (id: number) => void;
  setTipoPedido: (tipo: TipoPedido) => void;
  setClienteData: (clienteId: number | null, empresaId: number | null, esCredito: boolean) => void;
  
  addItem: (producto: Producto, cantidad: number, notas?: string, componentes?: ItemComanda[]) => void;
  removeItem: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, cantidad: number) => void;
  clearComanda: () => void;
  
  total: () => number;
}

export const useComandaStore = create<ComandaState>((set, get) => ({
  items: [],
  mesaId: null,
  tipoPedido: 'MESA',
  clienteId: null,
  empresaId: null,
  esCredito: false,

  setMesa: (id) => set({ mesaId: id }),
  setTipoPedido: (tipo) => set({ tipoPedido: tipo }),
  setClienteData: (clienteId, empresaId, esCredito) => set({ clienteId, empresaId, esCredito }),

  addItem: (producto, cantidad, notas = '', componentes = []) => {
    const currentItems = get().items;

    const existingItemIndex = currentItems.findIndex(
      (item) => 
        item.producto.id === producto.id && 
        item.notas === notas &&
        JSON.stringify(item.componentes) === JSON.stringify(componentes)
    );

    if (existingItemIndex !== -1) {
      const newItems = [...currentItems];
      newItems[existingItemIndex].cantidad += cantidad;
      set({ items: newItems });
    } else {
      set({
        items: [
          ...currentItems,
          {
            uniqueId: uuidv4(),
            producto,
            cantidad,
            notas,
            componentes
          }
        ]
      });
    }
  },

  removeItem: (uniqueId) => {
    set({ items: get().items.filter((i) => i.uniqueId !== uniqueId) });
  },

  updateQuantity: (uniqueId, cantidad) => {
    if (cantidad < 1) return;
    set({
      items: get().items.map((item) => 
        item.uniqueId === uniqueId ? { ...item, cantidad } : item
      )
    });
  },

  clearComanda: () => set({ items: [], mesaId: null, clienteId: null, empresaId: null, esCredito: false }),

  total: () => {
    return get().items.reduce((acc, item) => {
      let subtotal = item.producto.precio * item.cantidad;

      if (item.componentes) {
        const totalComponentes = item.componentes.reduce((accHijo, hijo) => accHijo + (hijo.producto.precio * hijo.cantidad), 0);
        subtotal += totalComponentes * item.cantidad; 
      }
      return acc + subtotal;
    }, 0);
  }
}));