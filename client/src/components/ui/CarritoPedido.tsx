import { Trash2, Plus, Minus, ShoppingBag, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ItemCarrito, Mesa } from '../types/pos.types';

interface CarritoPedidoProps {
  items: ItemCarrito[];
  mesaSeleccionada: Mesa | null;
  onCambiarCantidad: (productoId: number, delta: number) => void;
  onEliminar: (productoId: number) => void;
  onEnviarPedido: () => void;
  onLimpiar: () => void;
  isLoading: boolean;
}

export function CarritoPedido({
  items,
  mesaSeleccionada,
  onCambiarCantidad,
  onEliminar,
  onEnviarPedido,
  onLimpiar,
  isLoading,
}: CarritoPedidoProps) {
  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const vacio = items.length === 0;

  return (
    <div className="flex flex-col h-full">

      {/* Header del carrito */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <ShoppingBag size={16} className="text-primary" />
            Orden actual
          </h2>
          {mesaSeleccionada && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Mesa <span className="font-bold text-foreground">{mesaSeleccionada.numero}</span>
            </p>
          )}
        </div>
        {!vacio && (
          <Button variant="ghost" size="sm" className="text-destructive h-7 text-xs" onClick={onLimpiar}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Lista de items */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {vacio ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <ShoppingBag size={36} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">Sin productos</p>
            <p className="text-xs mt-1 opacity-70">Selecciona platillos del catálogo</p>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.productoId}
              className="flex items-center gap-3 bg-muted/40 rounded-lg p-2.5 border border-border/60"
            >
              {/* Imagen mini */}
              <div className="w-10 h-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                {item.imagenUrl ? (
                  <img src={item.imagenUrl} alt={item.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <ShoppingBag size={14} className="text-primary/40" />
                  </div>
                )}
              </div>

              {/* Nombre y precio */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.nombre}</p>
                <p className="text-xs text-muted-foreground">S/ {item.precio.toFixed(2)}</p>
              </div>

              {/* Controles de cantidad */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onCambiarCantidad(item.productoId, -1)}
                  className="h-6 w-6 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Minus size={10} />
                </button>
                <span className="text-sm font-bold w-5 text-center">{item.cantidad}</span>
                <button
                  onClick={() => onCambiarCantidad(item.productoId, 1)}
                  className="h-6 w-6 rounded-full border border-primary bg-primary/5 flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Plus size={10} className="text-primary" />
                </button>
              </div>

              {/* Subtotal + eliminar */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs font-bold text-foreground">
                  S/ {(item.precio * item.cantidad).toFixed(2)}
                </span>
                <button
                  onClick={() => onEliminar(item.productoId)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer con total y botón */}
      <div className={cn(
        'mt-4 pt-4 border-t border-border space-y-3 transition-all',
        vacio && 'opacity-50 pointer-events-none'
      )}>
        {/* Desglose */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-primary">S/ {subtotal.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {items.reduce((s, i) => s + i.cantidad, 0)} producto(s) en la orden
          </p>
        </div>

        {/* Botón enviar a cocina */}
        <Button
          className="w-full gap-2"
          disabled={vacio || isLoading || !mesaSeleccionada}
          onClick={onEnviarPedido}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {isLoading ? 'Enviando...' : 'Enviar a Cocina'}
        </Button>

        {!mesaSeleccionada && !vacio && (
          <p className="text-center text-xs text-amber-600">
            ⚠ Selecciona una mesa primero
          </p>
        )}
      </div>
    </div>
  );
}
