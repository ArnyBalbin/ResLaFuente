import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, Send, Loader2, MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COSTO_LLEVAR } from '../types/pos.types';
import type { ItemCarrito, Mesa } from '../types/pos.types';
import type { TipoPedido } from '@/types';

interface CarritoPedidoProps {
  items: ItemCarrito[];
  mesaSeleccionada: Mesa | null;
  tipo: TipoPedido;
  onCambiarCantidad: (productoId: number, delta: number) => void;
  onEliminar: (productoId: number) => void;
  onActualizarNotas: (productoId: number, notas: string) => void;
  onEnviarPedido: () => void;
  onLimpiar: () => void;
  isLoading: boolean;
}

export function CarritoPedido({
  items, mesaSeleccionada, tipo,
  onCambiarCantidad, onEliminar, onActualizarNotas,
  onEnviarPedido, onLimpiar, isLoading,
}: CarritoPedidoProps) {
  const [notasAbiertas, setNotasAbiertas] = useState<number | null>(null);
  const [notaTemp, setNotaTemp] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const costoLlevar = tipo === 'LLEVAR' ? items.reduce((sum, item) => sum + item.cantidad, 0) * COSTO_LLEVAR : 0;
  const total = subtotal + costoLlevar;
  const vacio = items.length === 0;

  const abrirNotas = (item: ItemCarrito) => {
    setNotasAbiertas(item.productoId);
    setNotaTemp(item.notas || '');
  };

  const guardarNotas = (productoId: number) => {
    onActualizarNotas(productoId, notaTemp);
    setNotasAbiertas(null);
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <ShoppingBag size={16} className="text-primary" />
          Orden actual
        </h2>
        {!vacio && (
          <button onClick={onLimpiar} className="text-xs text-destructive hover:underline">
            Limpiar
          </button>
        )}
      </div>

      {/* Mesa info */}
      {mesaSeleccionada && (
        <div className="mb-2 px-2 py-1 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-primary font-medium">
            🍽 Mesa {mesaSeleccionada.numero}
            {tipo === 'LLEVAR' && ' · 🥡 Para llevar'}
            {tipo === 'DELIVERY' && ' · 🛵 Delivery'}
          </p>
        </div>
      )}

      {/* Lista de items */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
        {vacio ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <ShoppingBag size={32} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">Sin productos</p>
            <p className="text-xs mt-1 opacity-70">Selecciona platillos del catálogo</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.productoId} className="bg-muted/40 rounded-lg border border-border/60 overflow-hidden">
              <div className="flex items-center gap-2 p-2">
                {/* Imagen mini */}
                <div className="w-9 h-9 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  {item.imagenUrl ? (
                    <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <ShoppingBag size={12} className="text-primary/40" />
                    </div>
                  )}
                </div>

                {/* Nombre y precio */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{item.nombre}</p>
                  <p className="text-xs text-muted-foreground">S/ {item.precio.toFixed(2)}</p>
                </div>

                {/* Controles cantidad */}
                <div className="flex items-center gap-1">
                  <button onClick={() => onCambiarCantidad(item.productoId, -1)}
                    className="h-5 w-5 rounded-full border border-border flex items-center justify-center hover:bg-muted">
                    <Minus size={9} />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{item.cantidad}</span>
                  <button onClick={() => onCambiarCantidad(item.productoId, 1)}
                    className="h-5 w-5 rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center hover:bg-primary/20">
                    <Plus size={9} className="text-primary" />
                  </button>
                </div>

                {/* Subtotal + acciones */}
                <div className="flex flex-col items-end gap-1 ml-1">
                  <span className="text-xs font-bold">S/ {(item.precio * item.cantidad).toFixed(2)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => abrirNotas(item)}
                      className={cn('hover:text-primary transition-colors', item.notas ? 'text-primary' : 'text-muted-foreground')}>
                      <MessageSquare size={11} />
                    </button>
                    <button onClick={() => onEliminar(item.productoId)}
                      className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel de notas */}
              {notasAbiertas === item.productoId && (
                <div className="px-2 pb-2 pt-0 border-t border-border/40">
                  <div className="flex gap-1 mt-1.5">
                    <input
                      autoFocus
                      type="text"
                      value={notaTemp}
                      onChange={e => setNotaTemp(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && guardarNotas(item.productoId)}
                      placeholder="Ej: sin cebolla, pecho, poco azúcar..."
                      className="flex-1 text-xs border border-border rounded px-2 py-1 bg-background focus:outline-none focus:border-primary"
                    />
                    <button onClick={() => guardarNotas(item.productoId)}
                      className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded font-medium hover:bg-primary/90">
                      OK
                    </button>
                    <button onClick={() => setNotasAbiertas(null)}
                      className="text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Mostrar nota guardada */}
              {item.notas && notasAbiertas !== item.productoId && (
                <div className="px-2 pb-1.5">
                  <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 inline-block">
                    📝 {item.notas}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer con totales */}
      <div className={cn('mt-3 pt-3 border-t border-border space-y-2', vacio && 'opacity-50 pointer-events-none')}>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Subtotal</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          {costoLlevar > 0 && (
            <div className="flex justify-between text-xs text-amber-600">
              <span>Envase (×{items.reduce((s, i) => s + i.cantidad, 0)} platos)</span>
              <span>S/ {costoLlevar.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold">
            <span>Total</span>
            <span className="text-primary">S/ {total.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {items.reduce((s, i) => s + i.cantidad, 0)} producto(s)
          </p>
        </div>

        <button
          className={cn(
            'w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all',
            vacio || isLoading || (!mesaSeleccionada && tipo === 'MESA')
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
          disabled={vacio || isLoading || (!mesaSeleccionada && tipo === 'MESA')}
          onClick={onEnviarPedido}
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {isLoading ? 'Enviando...' : 'Enviar a Cocina'}
        </button>

        {!mesaSeleccionada && tipo === 'MESA' && !vacio && (
          <p className="text-center text-xs text-amber-600">⚠ Selecciona una mesa primero</p>
        )}
      </div>
    </div>
  );
}
